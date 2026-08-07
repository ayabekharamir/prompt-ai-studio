"""
Security middleware preparation.

Phase 1 scope: wire the middleware pipeline and make it configuration-driven,
without forcing behavior changes on existing deployments. Everything here is
OFF by default unless explicitly enabled via environment variables, mirroring
the existing "architecture ready, not activated" pattern used for OTP/OAuth.

- TrustedHostMiddleware: only enforced when ALLOWED_HOSTS != "*".
- RateLimitMiddleware: a minimal in-process fixed-window limiter, gated by
  RATE_LIMIT_ENABLED. It is intentionally simple (per-worker, in-memory) and
  documented as NOT production-grade for a multi-worker deployment - swap
  in Redis (e.g. via slowapi + redis) before relying on it under real load.
"""

import time
from collections import defaultdict, deque

from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.middleware.trustedhost import TrustedHostMiddleware

from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)


class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    Fixed-window rate limiter keyed by client IP.

    NOTE: in-memory and per-process - fine for a single-worker dev/staging
    deployment or as a placeholder, but must be backed by a shared store
    (Redis) before running with multiple uvicorn/gunicorn workers.
    """

    def __init__(self, app, requests_per_minute: int):
        super().__init__(app)
        self.limit = requests_per_minute
        self.window_seconds = 60
        self._hits: dict[str, deque] = defaultdict(deque)

    async def dispatch(self, request: Request, call_next):
        client_ip = request.client.host if request.client else "unknown"
        now = time.monotonic()
        hits = self._hits[client_ip]

        while hits and now - hits[0] > self.window_seconds:
            hits.popleft()

        if len(hits) >= self.limit:
            logger.warning("rate_limit_exceeded", extra={"client_ip": client_ip})
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={
                    "error": {
                        "code": "rate_limited",
                        "message": "Too many requests. Please try again later.",
                    }
                },
            )

        hits.append(now)
        return await call_next(request)


def register_security_middleware(app: FastAPI) -> None:
    if settings.ALLOWED_HOSTS and settings.ALLOWED_HOSTS != "*":
        allowed_hosts = [h.strip() for h in settings.ALLOWED_HOSTS.split(",") if h.strip()]
        app.add_middleware(TrustedHostMiddleware, allowed_hosts=allowed_hosts)

    if settings.RATE_LIMIT_ENABLED:
        app.add_middleware(
            RateLimitMiddleware, requests_per_minute=settings.RATE_LIMIT_PER_MINUTE
        )
