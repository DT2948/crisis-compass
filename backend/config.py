import os
from functools import lru_cache
from pathlib import Path

from dotenv import load_dotenv
from pydantic import BaseModel, Field


load_dotenv(Path(__file__).resolve().parent / ".env")


class Settings(BaseModel):
    app_name: str = "CrisisCompass API"
    app_description: str = "AI-powered crisis intelligence and coordination platform"
    version: str = "0.1.0"
    database_url: str = Field(
        default_factory=lambda: os.getenv(
            "DATABASE_URL",
            "sqlite://",
        )
    )
    watsonx_api_key: str = Field(default_factory=lambda: os.getenv("WATSONX_API_KEY", ""))
    watsonx_flow_id: str = Field(default_factory=lambda: os.getenv("WATSONX_FLOW_ID", ""))
    watsonx_base_url: str = Field(default_factory=lambda: os.getenv("WATSONX_BASE_URL", ""))


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
