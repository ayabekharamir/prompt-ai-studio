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

    # Brand Assets / Object Storage (Phase: Brand Assets Foundation)[cite: 4]
    # STORAGE_PROVIDER selects the storage backend behind the[cite: 4]
    # StorageProvider abstraction (see app/services/storage/). "local"[cite: 4]
    # writes to a filesystem path so this works on any Linux host[cite: 4]
    # (including non-cloud hosts like Miznbanfa) with zero external[cite: 4]
    # dependencies. A future "s3" provider (S3-compatible, e.g. R2, Arvan,[cite: 4]
    # Liara, etc.) can be added later without changing brand_assets or the[cite: 4]
    # API - only STORAGE_PROVIDER + its own settings would change.[cite: 4]
    STORAGE_PROVIDER: str = "local"[cite: 4]

    # Absolute path on the host/container filesystem where uploaded brand[cite: 4]
    # assets are persisted. Must point at a persistent, writable directory[cite: 4]
    # (e.g. a mounted volume/disk) in production - otherwise files are[cite: 4]
    # lost on redeploy/restart. Defaults to a generic absolute path so any[cite: 4]
    # plain Linux/Docker host (Miznbanfa or otherwise) just needs to mount[cite: 4]
    # a persistent volume/disk at this path; override via the[cite: 4]
    # STORAGE_LOCAL_PATH env var if a different path is required.[cite: 4]
    STORAGE_LOCAL_PATH: str = "/data/brand-assets"[cite: 4]

    # Upload constraints[cite: 4]
    MAX_UPLOAD_SIZE_MB: int = 8[cite: 4]

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
