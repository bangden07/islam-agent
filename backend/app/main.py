"""
FastAPI application — thin proxy to DigitalOcean Gradient™ AI Platform.

Run locally: uvicorn app.main:app --reload --port 8080
"""

import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.gradient_proxy import answer_via_gradient
from app.schemas import ChatRequest, ChatResponse
from app.settings import settings

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s  %(message)s",
)

logger = logging.getLogger(__name__)

app = FastAPI(
    title="Islam Knowledge Base Agent",
    version="1.0.0",
    description="Thin proxy ke Gradient™ AI Platform untuk menjawab pertanyaan umat Islam.",
)

# --- CORS ---
origins = [o.strip() for o in settings.cors_origins.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Routes ---
@app.get("/health")
async def health():
    return {"status": "ok", "env": settings.app_env}


@app.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    """Chat endpoint — proxy ke Gradient™ agent."""
    return await answer_via_gradient(req.message, image=req.image)
