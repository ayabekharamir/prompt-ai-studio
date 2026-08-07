"""
Structured logging setup.

Uses the standard library `logging` module (no extra dependency) with a
JSON formatter, so log lines are machine-parseable in production while
staying human-readable in development (LOG_JSON=false).

Usage:
    from app.core.logging import configure_logging, get_logger
    configure_logging()          # call once, at startup (see main.py)
    logger = get_logger(__name__)
    logger.info("user_registered", extra={"user_id": str(user.id)})
"""

import json
import logging
import sys
from datetime import datetime, timezone
from typing import Any

from app.core.config import settings

# Attributes every stdlib LogRecord already has; anything else passed via
# `extra={...}` is application-supplied context we want to surface in JSON.
_RESERVED_RECORD_ATTRS = set(logging.LogRecord("", 0, "", 0, "", (), None).__dict__.keys())


class JSONFormatter(logging.Formatter):
    """Renders each log record as a single-line JSON object."""

    def format(self, record: logging.LogRecord) -> str:
        payload: dict[str, Any] = {
            "timestamp": datetime.fromtimestamp(record.created, tz=timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }

        if record.exc_info:
            payload["exception"] = self.formatException(record.exc_info)

        for key, value in record.__dict__.items():
            if key not in _RESERVED_RECORD_ATTRS and key not in payload:
                payload[key] = value

        return json.dumps(payload, default=str)


def configure_logging() -> None:
    """Configure the root logger once at application startup."""
    root = logging.getLogger()
    root.setLevel(settings.LOG_LEVEL)

    # Avoid duplicate handlers on reload (uvicorn --reload re-imports main).
    root.handlers.clear()

    handler = logging.StreamHandler(sys.stdout)
    if settings.LOG_JSON:
        handler.setFormatter(JSONFormatter())
    else:
        handler.setFormatter(
            logging.Formatter("%(asctime)s | %(levelname)-8s | %(name)s | %(message)s")
        )

    root.addHandler(handler)

    # Quiet noisy third-party loggers down to the configured level too,
    # so they don't bypass the JSON formatter with their own format.
    for noisy_logger in ("uvicorn", "uvicorn.access", "uvicorn.error", "sqlalchemy.engine"):
        logging.getLogger(noisy_logger).handlers = []
        logging.getLogger(noisy_logger).propagate = True


def get_logger(name: str) -> logging.Logger:
    return logging.getLogger(name)
