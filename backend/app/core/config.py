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

    # Brand Assets / Object Storage (Phase: Brand Assets Foundation)
    # STORAGE_PROVIDER selects the storage backend behind the
    # StorageProvider abstraction (see app/services/storage/). "local"
    # writes to a filesystem path so this works on any Linux host
    # (including non-cloud hosts like Miznbanfa) with zero external
    # dependencies. A future "s3" provider (S3-compatible, e.g. R2, Arvan,
    # Liara, etc.) can be added later without changing brand_assets or the
    # API - only STORAGE_PROVIDER + its own settings would change.
    STORAGE_PROVIDER: str = "local"

    # Absolute path on the host/container filesystem where uploaded brand
    # assets are persisted. Must point at a persistent, writable directory
    # (e.g. a mounted volume/disk) in production - otherwise files are
    # lost on redeploy/restart. Defaults to a generic absolute path so any
    # plain Linux/Docker host (Miznbanfa or otherwise) just needs to mount
    # a persistent volume/disk at this path; override via the
    # STORAGE_LOCAL_PATH env var if a different path is required.
    STORAGE_LOCAL_PATH: str = "/data/brand-assets"

    # Upload constraints
    MAX_UPLOAD_SIZE_MB: int = 8

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
