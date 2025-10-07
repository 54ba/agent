from pydantic_settings import BaseSettings
from typing import Optional
import os

class Settings(BaseSettings):
    # API Configuration
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000

    # LangChain Configuration
    OPENAI_API_KEY: Optional[str] = None

    # Amadeus API Configuration
    AMADEUS_API_KEY: Optional[str] = None
    AMADEUS_API_SECRET: Optional[str] = None

    # OpenAI API Configuration
    OPENAI_API_KEY: Optional[str] = None

    # PDF Processing Configuration (keeping for now, will remove later)
    UPLOAD_DIR: str = os.path.join("app", "uploads")
    MAX_UPLOAD_SIZE: int = 10485760  # 10MB in bytes

    class Config:
        env_file = ".env"

settings = Settings()