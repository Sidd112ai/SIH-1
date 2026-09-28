import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Industrial Compliance & Approval Platform"
    PROJECT_TAGLINE: str = "One Platform from Approval Discovery to Document Readiness to Compliance"
    API_V1_STR: str = "/api"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./compliance_platform.db")
    JWT_SECRET: str = os.getenv("JWT_SECRET", "dev-only-change-this-secret")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day
    STORAGE_PATH: str = os.getenv("STORAGE_PATH", "./storage")
    DEMO_MODE: bool = True
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")

    class Config:
        case_sensitive = True

settings = Settings()

# Ensure storage directories exist
os.makedirs(os.path.join(settings.STORAGE_PATH, "uploads"), exist_ok=True)
os.makedirs(os.path.join(settings.STORAGE_PATH, "packages"), exist_ok=True)
os.makedirs(os.path.join(settings.STORAGE_PATH, "samples"), exist_ok=True)
