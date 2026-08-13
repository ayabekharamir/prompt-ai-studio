"""
FastAPI application bootstrap.

Phase 1 scope: core REST API foundation
(auth, workspaces, brands, brand brain,
prompt templates, prompts).

AI generation endpoints are intentionally NOT wired
to any AI provider yet.
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
    brand_assets,
    products,
    personas,
    prompt_templates,
    prompts,
)


# Logging
configure_logging()
logger = get_logger(__name__)


# FastAPI App
app = FastAPI(
    title=settings.APP_NAME,
    description="Brand Intelligence and Prompt Management SaaS Platform API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)


# Exception handlers
register_exception_handlers(app)


# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Security middleware
register_security_middleware(app)


# Startup
@app.on_event("startup")
def on_startup() -> None:
    logger.info(
        "app_startup",
        extra={
            "environment": settings.ENVIRONMENT,
            "app_name": settings.APP_NAME,
        },
    )


# API Prefix
API_PREFIX = "/api/v1"


# Routers
app.include_router(
    auth.router,
    prefix=f"{API_PREFIX}/auth",
    tags=["Auth"],
)

app.include_router(
    users.router,
    prefix=f"{API_PREFIX}/users",
    tags=["Users"],
)

app.include_router(
    workspaces.router,
    prefix=f"{API_PREFIX}/workspaces",
    tags=["Workspaces"],
)

app.include_router(
    brands.router,
    prefix=f"{API_PREFIX}/brands",
    tags=["Brands"],
)

app.include_router(
    brand_brain.router,
    prefix=f"{API_PREFIX}/brand-brain",
    tags=["Brand Brain"],
)

app.include_router(
    brand_assets.router,
    prefix=API_PREFIX,
    tags=["Brand Assets"],
)

app.include_router(
    products.router,
    prefix=API_PREFIX,
    tags=["Products"],
)

app.include_router(
    personas.router,
    prefix=API_PREFIX,
    tags=["Personas"],
)

app.include_router(
    prompt_templates.router,
    prefix=f"{API_PREFIX}/prompt-templates",
    tags=["Prompt Templates"],
)

app.include_router(
    prompts.router,
    prefix=f"{API_PREFIX}/prompts",
    tags=["Prompts"],
)


# Root endpoint
@app.get("/", tags=["Health"])
def root():
    return {
        "app": settings.APP_NAME,
        "status": "running",
        "phase": "Phase 1 - Development Foundation",
    }


# Railway Healthcheck endpoint
@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "ok"
    }
