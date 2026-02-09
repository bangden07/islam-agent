"""
Application settings – loaded from environment variables.
Copy .env.example → .env and fill in your values.

Mode: Gradient™ AI Platform (managed agent on DigitalOcean).
"""

from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

# Resolve .env relative to *this* file, not CWD
_ENV_FILE = Path(__file__).resolve().parent.parent / ".env"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=str(_ENV_FILE), env_file_encoding="utf-8")

    # --- App ---
    app_env: str = "development"
    app_port: int = 8080
    cors_origins: str = "*"  # comma-separated

    # --- Gradient™ AI Platform ---
    agent_endpoint: str = ""  # e.g. https://xxxxxxxx.agents.do-ai.run
    agent_access_key: str = ""  # access key from Gradient

    # --- Google Gemini (optional — enables image understanding) ---
    gemini_api_key: str = ""  # free key from https://aistudio.google.com/app/apikey


settings = Settings()
