"""
Global exception handlers.

Registered on the FastAPI app in main.py via `register_exception_handlers`.
Goal: every error response - expected or not - comes back as a consistent
JSON envelope, and every unhandled exception is logged with a stack trace
instead of leaking a raw 500 traceback to the client.

Response shape:
{
    "error": {
        "code": "<short machine-readable code>",
        "message": "<human-readable message>",
        "details": <optional extra data, e.g. validation errors>
    }
}
"""

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.logging import get_logger

logger = get_logger(__name__)


def _error_response(status_code: int, code: str, message: str, details=None) -> JSONResponse:
    body = {"error": {"code": code, "message": message}}
    if details is not None:
        body["error"]["details"] = details
    return JSONResponse(status_code=status_code, content=body)


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(request: Request, exc: StarletteHTTPException):
        # Covers both Starlette's HTTPException and FastAPI's HTTPException
        # (FastAPI's subclasses Starlette's), e.g. `raise HTTPException(404, ...)`.
        logger.info(
            "http_exception",
            extra={
                "path": request.url.path,
                "method": request.method,
                "status_code": exc.status_code,
                "detail": exc.detail,
            },
        )
        return _error_response(
            status_code=exc.status_code,
            code=_code_for_status(exc.status_code),
            message=str(exc.detail),
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        logger.info(
            "validation_error",
            extra={"path": request.url.path, "method": request.method, "errors": exc.errors()},
        )
        return _error_response(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            code="validation_error",
            message="Request validation failed",
            details=exc.errors(),
        )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception):
        logger.error(
            "unhandled_exception",
            exc_info=exc,
            extra={"path": request.url.path, "method": request.method},
        )
        return _error_response(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            code="internal_server_error",
            message="An unexpected error occurred.",
        )


def _code_for_status(status_code: int) -> str:
    return {
        status.HTTP_400_BAD_REQUEST: "bad_request",
        status.HTTP_401_UNAUTHORIZED: "unauthorized",
        status.HTTP_403_FORBIDDEN: "forbidden",
        status.HTTP_404_NOT_FOUND: "not_found",
        status.HTTP_409_CONFLICT: "conflict",
        status.HTTP_422_UNPROCESSABLE_ENTITY: "validation_error",
    }.get(status_code, "http_error")
