import os
from typing import Optional

class Settings:
    # API Configuration
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000

    # Amadeus API Configuration
    AMADEUS_API_KEY: Optional[str] = os.environ.get("AMADEUS_API_KEY")
    AMADEUS_API_SECRET: Optional[str] = os.environ.get("AMADEUS_API_SECRET")

    # AI API Configuration
    GROQ_API_KEY: Optional[str] = os.environ.get("GROQ_API_KEY")

    # PDF Processing Configuration (keeping for now, will remove later)
    UPLOAD_DIR: str = os.path.join("app", "uploads")
    MAX_UPLOAD_SIZE: int = 10485760  # 10MB in bytes

    # Frontend API Configuration
    API_BASE_URL: str = ""

settings = Settings()