import os
from functools import lru_cache

from dotenv import load_dotenv
from pydantic import BaseModel, Field


load_dotenv()


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


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
