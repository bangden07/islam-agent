"""
Request / Response models for the API.
"""

from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000, description="Pertanyaan pengguna")
    image: str | None = Field(default=None, description="Opsional: gambar base64 (data URI)")
    user_id: str | None = Field(default=None, description="Opsional: ID pengguna")


class Citation(BaseModel):
    source: str = Field(..., description="Nama file/kitab sumber")
    title: str = Field(default="", description="Judul bagian/bab")
    snippet: str = Field(default="", description="Potongan teks yang relevan")


class ChatResponse(BaseModel):
    answer: str
    citations: list[Citation] = []
    disclaimer: str = ""
