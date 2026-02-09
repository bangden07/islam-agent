"""
Gradient™ AI Platform proxy — forwards requests to the managed agent endpoint.
Keeps the access key server-side (not in the client app).

Image flow (Gradient does NOT support vision/multimodal):
  User image  →  Gemini 2.0 Flash (extract text / describe)  →  text
  text + user question  →  Gradient Agent (KB-grounded answer)

Web search fallback:
  Gradient answer has 0 relevant KB citations  →  Gemini + Google Search
  grounding  →  answer with web sources
"""

import logging

import httpx

from app.schemas import ChatResponse, Citation
from app.settings import settings
from app.vision import describe_image
from app.web_search import search_and_answer

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = (
    "Kamu adalah asisten Islam yang ramah, hangat, dan natural. "
    "Aturan format jawaban:\n"
    "1. Untuk sapaan atau obrolan ringan (mis. salam, kabar, terima kasih), "
    "jawab singkat dan hangat secara manusiawi TANPA menambahkan bagian "
    "'Rujukan', 'Langkah Praktis', 'Catatan', atau 'Disclaimer'. "
    "Cukup balas secara natural saja.\n"
    "2. Untuk pertanyaan yang BENAR-BENAR mencari ilmu Islam (fiqh, aqidah, "
    "hadis, tafsir, kehidupan sehari-hari, dll.), barulah jawab dengan "
    "format terstruktur yang rapi: sertakan dalil/rujukan jika relevan, "
    "langkah praktis jika diperlukan, dan catatan penting jika ada.\n"
    "3. Gunakan bahasa yang lembut, jelas, dan tidak menggurui.\n"
    "4. Jika tidak yakin apakah pertanyaan membutuhkan rujukan, "
    "tanyakan klarifikasi dengan sopan.\n"
    "5. Jangan pernah memvonis seseorang; fokus pada ilmu dan solusi.\n"
    "6. PENTING: Jika knowledge base tidak memiliki informasi yang relevan "
    "untuk menjawab pertanyaan, JUJUR katakan 'Belum ditemukan rujukan "
    "spesifik di knowledge base untuk pertanyaan ini.' Jangan memaksakan "
    "jawaban dari knowledge base yang tidak relevan."
)


async def answer_via_gradient(message: str, image: str | None = None) -> ChatResponse:
    """
    Proxy a user message to the Gradient agent endpoint and
    transform the response into our ChatResponse format.
    """
    if not settings.agent_endpoint or not settings.agent_access_key:
        raise RuntimeError(
            "Gradient agent_endpoint and agent_access_key must be set in .env"
        )

    url = f"{settings.agent_endpoint.rstrip('/')}/api/v1/chat/completions"

    # --- Image handling via Gemini Vision (Gradient has no multimodal) ---
    image_context = ""
    if image:
        if settings.gemini_api_key:
            description = await describe_image(image, settings.gemini_api_key)
            if description:
                image_context = (
                    "\n\n[Konten gambar yang dikirim pengguna]\n"
                    f"{description}\n"
                    "[/Konten gambar]\n\n"
                    "Jawab pertanyaan pengguna berdasarkan konten gambar di atas "
                    "dan pengetahuan dari knowledge base."
                )
            else:
                image_context = (
                    "\n\n(Pengguna mengirim gambar tetapi konten tidak dapat "
                    "diekstrak. Beritahu pengguna untuk menjelaskan isi gambar "
                    "secara manual.)"
                )
        else:
            logger.warning("Image received but GEMINI_API_KEY not configured")
            image_context = (
                "\n\n(Pengguna mengirim gambar tetapi fitur analisis gambar "
                "belum dikonfigurasi. Beritahu pengguna bahwa fitur ini "
                "memerlukan konfigurasi tambahan oleh administrator.)"
            )

    user_text = (message or "Tolong jelaskan gambar ini.") + image_context

    payload = {
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_text},
        ],
        "stream": False,
        "include_retrieval_info": True,
        "include_guardrails_info": True,
    }

    try:
        async with httpx.AsyncClient(timeout=120) as http:
            resp = await http.post(
                url,
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {settings.agent_access_key}",
                },
                json=payload,
            )
            resp.raise_for_status()
            data = resp.json()
    except httpx.HTTPStatusError as exc:
        logger.error("Gradient API error %s: %s", exc.response.status_code, exc.response.text)
        return ChatResponse(
            answer=(
                "Maaf, terjadi kendala saat menghubungi server AI. "
                "Silakan coba lagi beberapa saat lagi."
            ),
            citations=[],
            disclaimer="",
        )
    except httpx.RequestError as exc:
        logger.error("Gradient API request failed: %s", exc)
        return ChatResponse(
            answer=(
                "Maaf, tidak dapat terhubung ke server AI saat ini. "
                "Pastikan koneksi internet Anda stabil dan coba lagi."
            ),
            citations=[],
            disclaimer="",
        )

    # --- Transform Gradient response → our ChatResponse ---
    choice = data.get("choices", [{}])[0]
    answer_text = choice.get("message", {}).get("content", "")

    # Extract citations and relevance scores from retrieval info
    retrieval = data.get("retrieval", {}).get("retrieved_data", [])
    citations = []
    relevance_scores: list[float] = []
    for item in retrieval:
        score = item.get("score", 0)
        # Gradient uses a large negative sentinel for "no match"; skip those
        if isinstance(score, (int, float)) and score > -1_000_000:
            relevance_scores.append(float(score))
        citations.append(
            Citation(
                source=item.get("filename", "Unknown"),
                title="",
                snippet=(item.get("page_content", "") or "")[:200],
            )
        )

    # Log retrieval summary for debugging
    logger.info(
        "Gradient retrieval: %d items, best_score=%.2f",
        len(retrieval),
        max(relevance_scores) if relevance_scores else 0.0,
    )

    # Check guardrails
    guardrails = data.get("guardrails", {}).get("triggered_guardrails", [])
    if guardrails:
        logger.warning("Guardrails triggered: %s", guardrails)

    if not answer_text:
        answer_text = (
            "Maaf, saat ini saya mengalami kendala dan belum bisa menjawab. "
            "Silakan coba lagi beberapa saat lagi."
        )

    # For casual/greeting messages, skip citations & disclaimer
    is_casual = _is_casual(message)

    # --- Web search fallback ---
    # If KB returned no meaningful citations and this isn't a casual message,
    # try Gemini with Google Search grounding for a web-sourced answer.
    if (
        not is_casual
        and settings.gemini_api_key
        and _needs_web_fallback(answer_text, citations, relevance_scores)
    ):
        logger.info("KB has no relevant citations — falling back to web search")
        web_result = await search_and_answer(
            user_text,  # includes image context if any
            settings.gemini_api_key,
        )
        if web_result and web_result.answer:
            answer_text = web_result.answer
            # Replace KB citations with web sources
            citations = [
                Citation(
                    source=src.get("url", ""),
                    title=src.get("title", ""),
                    snippet=src.get("snippet", "")[:200],
                )
                for src in web_result.sources
            ]
            logger.info("Web search provided %d sources", len(citations))

    return ChatResponse(
        answer=answer_text,
        citations=citations if not is_casual else [],
        disclaimer=(
            "Jawaban ini bersifat informatif dan bukan fatwa resmi. "
            "Untuk kasus spesifik, silakan konsultasikan dengan ustaz/ulama setempat."
        ) if not is_casual else "",
    )


def _needs_web_fallback(
    answer: str,
    citations: list[Citation],
    relevance_scores: list[float],
) -> bool:
    """Heuristic: should we try a web search?

    Returns True when the KB answer is likely insufficient:
    - Answer contains explicit "I don't know" / "not found" markers, OR
    - All retrieval relevance scores are below threshold (KB has no
      genuinely relevant document for this query), OR
    - The LLM answered from general knowledge but KB citations don't
      actually match the topic.
    """
    # 1) Check if Gradient's answer explicitly admits it can't answer
    low = answer.lower()
    uncertain_markers = [
        "tidak ditemukan",
        "tidak tersedia",
        "belum tersedia",
        "tidak ada informasi",
        "belum memiliki informasi",
        "tidak memiliki informasi",
        "di luar kemampuan",
        "di luar cakupan",
        "saya tidak tahu",
        "saya tidak yakin",
        "tidak dapat menjawab",
        "belum bisa menjawab",
        "tidak menemukan",
        "belum ditemukan rujukan",
        "tidak ada dalam basis",
        "tidak ada dalam knowledge",
        "tidak ada dalil",
        "tidak memiliki data",
        "tidak ada data",
        "hanya dapat membantu",  # "saya hanya dapat membantu menjawab..."
        "bukan bidang saya",
        "di luar topik",
        "bukan topik",
        "tidak berkaitan",
    ]
    for marker in uncertain_markers:
        if marker in low:
            logger.info("Fallback triggered by marker: '%s'", marker)
            return True

    # 2) No citations at all
    if not citations:
        logger.info("Fallback triggered: no citations")
        return True

    # 3) Relevance score check — if no score is above the threshold,
    #    the KB has no genuinely relevant content for this query.
    #    Filter out sentinel scores (large negatives).
    if relevance_scores:
        best_score = max(relevance_scores)
        logger.debug("Best KB relevance score: %.2f", best_score)
        # Below 2.0 means really no match at all
        if best_score < 2.0:
            logger.info("Fallback triggered: best score %.2f < 2.0", best_score)
            return True

    return False


def _is_casual(text: str) -> bool:
    """Heuristic: detect greetings / small-talk so we can skip
    citations & disclaimer for natural conversation."""
    t = text.strip().lower()
    casual_patterns = [
        "assalamu", "assalamualaikum", "salam", "hai", "halo", "hello", "hi ",
        "kabar", "apa kabar", "bagaimana kabar", "terima kasih", "makasih",
        "jazakallah", "syukron", "barakallah", "alhamdulillah",
        "selamat pagi", "selamat siang", "selamat sore", "selamat malam",
        "siapa kamu", "siapa anda", "nama kamu", "nama anda",
    ]
    return any(p in t for p in casual_patterns)
