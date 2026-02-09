"""
Web search fallback — uses Gemini with Google Search Grounding.

When the local KB has no relevant answer, this module calls Gemini 2.5 Flash
Lite with ``tools: [{"google_search": {}}]`` so that Gemini can browse Google,
find authoritative Islamic sources, and return an answer with web citations.

No extra API key needed — reuses the same GEMINI_API_KEY.
"""

import logging
from dataclasses import dataclass

import httpx

logger = logging.getLogger(__name__)

GEMINI_URL = (
    "https://generativelanguage.googleapis.com/v1beta/models/"
    "gemini-2.5-flash-lite:generateContent"
)

SEARCH_SYSTEM_PROMPT = (
    "Kamu adalah asisten Islam yang terpercaya. "
    "Gunakan kemampuan Google Search untuk mencari jawaban dari sumber-sumber "
    "Islam yang terpercaya (islamqa.info, islamweb.net, nu.or.id, "
    "muhammadiyah.or.id, rumaysho.com, muslim.or.id, almanhaj.or.id, dsb.).\n\n"
    "Aturan:\n"
    "1. Jawab dalam Bahasa Indonesia yang lembut dan jelas.\n"
    "2. Sertakan dalil Al-Qur'an dan hadis jika relevan.\n"
    "3. Sebutkan sumber web yang kamu gunakan.\n"
    "4. Jika ada ikhtilaf (perbedaan pendapat), utamakan pendapat mazhab Syafi'i "
    "lalu sebutkan pendapat lain secara ringkas.\n"
    "5. Jangan memvonis; fokus pada ilmu dan solusi.\n"
    "6. Jika pertanyaan bukan tentang Islam, jawab secara umum dengan sopan."
)


@dataclass
class WebResult:
    """Structured result from a web-grounded Gemini call."""

    answer: str
    sources: list[dict]  # [{title, url, snippet}]


async def search_and_answer(
    question: str,
    gemini_api_key: str,
) -> WebResult | None:
    """Call Gemini with Google Search grounding to answer *question*.

    Returns a ``WebResult`` with the answer text and list of web sources,
    or ``None`` on any error.
    """
    payload = {
        "systemInstruction": {
            "parts": [{"text": SEARCH_SYSTEM_PROMPT}],
        },
        "contents": [
            {
                "role": "user",
                "parts": [{"text": question}],
            }
        ],
        "tools": [{"google_search": {}}],
        "generationConfig": {
            "temperature": 0.3,
            "maxOutputTokens": 4096,
        },
    }

    try:
        async with httpx.AsyncClient(timeout=90) as http:
            resp = await http.post(
                GEMINI_URL,
                params={"key": gemini_api_key},
                json=payload,
            )
            resp.raise_for_status()
            data = resp.json()

        # --- Extract answer text ---
        candidates = data.get("candidates", [])
        if not candidates:
            logger.warning("Gemini search returned no candidates")
            return None

        parts = candidates[0].get("content", {}).get("parts", [])
        text_parts = [p["text"] for p in parts if "text" in p]
        answer = "\n".join(text_parts).strip()
        if not answer:
            return None

        # --- Extract grounding sources ---
        grounding = candidates[0].get("groundingMetadata", {})
        sources: list[dict] = []

        # Method 1: groundingChunks (newer API)
        for chunk in grounding.get("groundingChunks", []):
            web = chunk.get("web", {})
            if web.get("uri"):
                sources.append(
                    {
                        "title": web.get("title", ""),
                        "url": web["uri"],
                        "snippet": "",
                    }
                )

        # Method 2: groundingSupports → segments with URIs
        for support in grounding.get("groundingSupports", []):
            for idx in support.get("groundingChunkIndices", []):
                # Already captured above via groundingChunks
                pass
            segment = support.get("segment", {})
            if segment.get("text") and idx < len(sources):
                sources[idx]["snippet"] = segment["text"][:200]

        # Method 3: searchEntryPoint (fallback) — rendered HTML, skip
        # Method 4: webSearchQueries — useful for logging
        queries = grounding.get("webSearchQueries", [])
        if queries:
            logger.info("Gemini searched: %s", queries)

        # Deduplicate sources by URL
        seen_urls: set[str] = set()
        unique_sources: list[dict] = []
        for src in sources:
            if src["url"] not in seen_urls:
                seen_urls.add(src["url"])
                unique_sources.append(src)

        logger.info(
            "Web search: %d chars answer, %d sources",
            len(answer),
            len(unique_sources),
        )
        return WebResult(answer=answer, sources=unique_sources)

    except httpx.HTTPStatusError as exc:
        logger.error(
            "Gemini search API error %s: %s",
            exc.response.status_code,
            exc.response.text[:300],
        )
        return None
    except httpx.RequestError as exc:
        logger.error("Gemini search request failed: %s", exc)
        return None
    except Exception as exc:  # noqa: BLE001
        logger.error("Gemini search unexpected error: %s", exc)
        return None
