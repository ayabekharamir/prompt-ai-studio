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

    # CORS - به صورت رشته ساده ذخیره می‌شود تا json.loads اجرا نشود
    CORS_ORIGINS: str = "http://localhost:3000"

    # Security preparation (Phase 1: prepared, not fully enforced)
    ALLOWED_HOSTS: str = "*"
    RATE_LIMIT_ENABLED: bool = False
    RATE_LIMIT_PER_MINUTE: int = 60

    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_JSON: bool = True

    # SMS OTP (SMS.ir)
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

    # AI Providers
    AI_PROVIDER: str = "none"

    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-4o-mini"

    ANTHROPIC_API_KEY: str = ""
    ANTHROPIC_MODEL: str = "claude-3-5-sonnet-20241022"

    GOOGLE_AI_API_KEY: str = ""
    GOOGLE_AI_MODEL: str = "gemini-1.5-flash"

    # Brand Assets / Object Storage
    STORAGE_PROVIDER: str = "local"
    STORAGE_LOCAL_PATH: str = "/data/brand-assets"
    MAX_UPLOAD_SIZE_MB: int = 8

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    def get_cors_origins(self) -> List[str]:
        """رشته CORS_ORIGINS را به لیست تبدیل می‌کند."""
        v = (self.CORS_ORIGINS or "").strip()
        if not v:
            return ["http://localhost:3000"]

        # اگر JSON باشد
        if v.startswith("["):
            import json
            try:
                parsed = json.loads(v)
                if isinstance(parsed, list):
                    return [str(item).strip() for item in parsed if str(item).strip()]
            except Exception:
                pass

        # جدا کردن با کاما
        return [
            origin.strip().strip('"').strip("'")
            for origin in v.split(",")
            if origin.strip()
        ]


settings = Settings()
