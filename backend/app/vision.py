"""
Vision module — uses Google Gemini 2.0 Flash (free tier) to extract text
and describe content from user-uploaded images.

Flow:
  base64 data-URI  →  Gemini vision  →  text description
  (then sent to Gradient agent for KB-grounded answer)

No extra Python packages needed — uses httpx (already a dependency).
"""

import logging
import re

import httpx

logger = logging.getLogger(__name__)

GEMINI_VISION_URL = (
    "https://generativelanguage.googleapis.com/v1beta/models/"
    "gemini-2.5-flash-lite:generateContent"
)

# Prompt directs Gemini to transcribe & describe — NOT interpret.
# Interpretation is left to the Gradient agent + KB.
VISION_PROMPT = (
    "Perhatikan gambar berikut dengan saksama.\n\n"
    "1. Jika gambar mengandung teks Arab (Al-Qur'an, hadis, kitab, atau "
    "tulisan tangan Arab), TRANSLITERASI semua teks Arab yang terlihat "
    "secara lengkap dan akurat. Gunakan tanda baca dan harakat jika terlihat.\n"
    "2. Jika ada teks non-Arab (Latin, Indonesia, dll.), salin juga.\n"
    "3. Jelaskan secara singkat konteks visual gambar "
    "(misalnya: halaman kitab, papan tulis, screenshot, dll.).\n\n"
    "Jangan menafsirkan atau memberikan hukum fiqh — cukup ekstrak dan "
    "deskripsikan konten gambar saja."
)


def _parse_data_uri(data_uri: str) -> tuple[str, str]:
    """Return (mime_type, base64_data) from a data-URI string.

    Supports:
      data:image/png;base64,iVBOR...
      data:image/jpeg;base64,/9j/4...
    Falls back to 'image/jpeg' if scheme is missing.
    """
    match = re.match(r"data:([^;]+);base64,(.+)", data_uri, re.DOTALL)
    if match:
        return match.group(1), match.group(2)
    # No data-URI header — assume raw base64 JPEG
    return "image/jpeg", data_uri


async def describe_image(data_uri: str, gemini_api_key: str) -> str | None:
    """Send *data_uri* to Gemini Vision and return a text description.

    Returns ``None`` on any error (caller should handle gracefully).
    """
    mime_type, b64_data = _parse_data_uri(data_uri)

    payload = {
        "contents": [
            {
                "parts": [
                    {"text": VISION_PROMPT},
                    {
                        "inline_data": {
                            "mime_type": mime_type,
                            "data": b64_data,
                        }
                    },
                ]
            }
        ],
        "generationConfig": {
            "temperature": 0.2,
            "maxOutputTokens": 2048,
        },
    }

    try:
        async with httpx.AsyncClient(timeout=60) as http:
            resp = await http.post(
                GEMINI_VISION_URL,
                params={"key": gemini_api_key},
                json=payload,
            )
            resp.raise_for_status()
            data = resp.json()

        # Extract generated text
        candidates = data.get("candidates", [])
        if not candidates:
            logger.warning("Gemini returned no candidates")
            return None

        parts = candidates[0].get("content", {}).get("parts", [])
        text_parts = [p["text"] for p in parts if "text" in p]
        result = "\n".join(text_parts).strip()

        if result:
            logger.info("Gemini vision extracted %d chars", len(result))
        return result or None

    except httpx.HTTPStatusError as exc:
        logger.error(
            "Gemini API error %s: %s",
            exc.response.status_code,
            exc.response.text[:300],
        )
        return None
    except httpx.RequestError as exc:
        logger.error("Gemini API request failed: %s", exc)
        return None
    except Exception as exc:          # noqa: BLE001
        logger.error("Gemini vision unexpected error: %s", exc)
        return None
