# app/core/config.py
import os
from pathlib import Path
from dotenv import load_dotenv
from pydantic_settings import BaseSettings

# Charge les variables d'environnement depuis le fichier .env
BASE_DIR = Path(__file__).resolve().parent.parent.parent
env_path = BASE_DIR / ".env"
load_dotenv(dotenv_path=env_path)


class Settings(BaseSettings):
    # JWT
    SECRET_KEY: str                    # Clé secrète pour signer les tokens
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24h

    # Google OAuth2
    GOOGLE_CLIENT_ID: str
    GOOGLE_CLIENT_SECRET: str
    ALLOWED_REDIRECT_URIS: str
    ALLOWED_ORIGINS: str

    @property
    def allowed_origins_list(self) -> list[str]:
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",") if o.strip()]

    # Cloudinary
    CLOUDINARY_CLOUD_NAME: str
    CLOUDINARY_API_KEY: str
    CLOUDINARY_API_SECRET: str

    # Database
    DATABASE_URL: str

    # Brevo (Email notifications)
    BREVO_API_KEY: str
    BREVO_SENDER_EMAIL: str
    BREVO_SENDER_NAME: str

    # Environment
    ENVIRONMENT: str = "development"
    FRONTEND_URL: str = "http://localhost:5173"

    class Config:
        env_file = ".env"
        extra = "allow"


settings = Settings()

