"""
Prompt AI Studio - Backend Entry Point
========================================
FastAPI application bootstrap.

Phase 1 scope: core REST API foundation (auth, workspaces, brands,
brand brain, prompt templates, prompts).
AI generation endpoints are intentionally NOT wired to any AI provider yet.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.logging import configure_logging, get_logger
from app.core.exception_handlers import register_exception_handlers
from app.core.security_middleware import register_security_middleware
from app.api.v1 import (
    auth,
    users,
    workspaces,
    brands,
    brand_brain,
    prompt_templates,
    prompts,
)

configure_logging()
logger = get_logger(__name__)

app = FastAPI(
    title=settings.APP_NAME,
    description="Brand Intelligence and Prompt Management SaaS Platform API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

register_exception_handlers(app)

# CORS - allow the frontend origin(s) defined in settings.
# CORS_ORIGINS is env-driven (see .env.example) so production can restrict
# this to the real deployed frontend origin(s) instead of localhost.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security middleware preparation (TrustedHost / rate limiting).
# Both are no-ops unless explicitly enabled via env vars - see
# app/core/security_middleware.py and .env.example.
register_security_middleware(app)


@app.on_event("startup")
def on_startup() -> None:
    logger.info(
        "app_startup",
        extra={"environment": settings.ENVIRONMENT, "app_name": settings.APP_NAME},
    )

API_PREFIX = "/api/v1"

app.include_router(auth.router, prefix=f"{API_PREFIX}/auth", tags=["Auth"])
app.include_router(users.router, prefix=f"{API_PREFIX}/users", tags=["Users"])
app.include_router(workspaces.router, prefix=f"{API_PREFIX}/workspaces", tags=["Workspaces"])
app.include_router(brands.router, prefix=f"{API_PREFIX}/brands", tags=["Brands"])
app.include_router(brand_brain.router, prefix=f"{API_PREFIX}/brand-brain", tags=["Brand Brain"])
app.include_router(prompt_templates.router, prefix=f"{API_PREFIX}/prompt-templates", tags=["Prompt Templates"])
app.include_router(prompts.router, prefix=f"{API_PREFIX}/prompts", tags=["Prompts"])


@app.get("/", tags=["Health"])
def root():
    return {
        "app": settings.APP_NAME,
        "status": "running",
        "phase": "Phase 1 - Development Foundation",
    }


@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "ok"}
