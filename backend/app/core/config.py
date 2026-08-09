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

    # Security preparation (Phase 1: prepared, not fully enforced)
    # Comma-separated hostnames for TrustedHostMiddleware; "*" disables the check.
    ALLOWED_HOSTS: str = "*"
    RATE_LIMIT_ENABLED: bool = False
    RATE_LIMIT_PER_MINUTE: int = 60

    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_JSON: bool = True

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

    # AI Providers (Phase 2B: active integration layer)
    # AI_PROVIDER selects the default provider used when a request does not
    # explicitly override it. "none" keeps AI execution disabled (safe default
    # until a provider + API key is configured).
    AI_PROVIDER: str = "none"

    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-4o-mini"

    ANTHROPIC_API_KEY: str = ""
    ANTHROPIC_MODEL: str = "claude-3-5-sonnet-20241022"

    GOOGLE_AI_API_KEY: str = ""
    GOOGLE_AI_MODEL: str = "gemini-1.5-flash"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
