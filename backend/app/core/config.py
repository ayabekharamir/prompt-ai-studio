"""
Application configuration.
Loads environment variables via pydantic-settings.
"""

from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # General
    ENVIRONMENT: str = "development"
    APP_NAME: str = "Prompt AI Studio"

    # Database
    DATABASE_URL: str = "postgresql://pas_user:change_me@localhost:5432/prompt_ai_studio"

    # Auth / JWT
    SECRET_KEY: str = "change_me_super_secret"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:3000"]

    # SMS OTP (SMS.ir) - architecture ready, inactive by default
    SMS_PROVIDER: str = "sms_ir"
    SMS_API_KEY: str = ""
    SMS_TEMPLATE_ID: str = ""
    SMS_SENDER_NUMBER: str = ""
    OTP_EXPIRE_SECONDS: int = 120
    OTP_MAX_RETRY: int = 5

    # OAuth (future)
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    APPLE_CLIENT_ID: str = ""
    APPLE_CLIENT_SECRET: str = ""
    MICROSOFT_CLIENT_ID: str = ""
    MICROSOFT_CLIENT_SECRET: str = ""

    # AI Providers (future - not connected in Phase 1)
    AI_PROVIDER: str = "none"
    OPENAI_API_KEY: str = ""
    ANTHROPIC_API_KEY: str = ""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
