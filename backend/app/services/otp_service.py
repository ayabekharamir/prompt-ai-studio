"""
OTP service (architecture ready, not activated in Phase 1).

Responsible for:
- Generating secure OTP codes
- Temporary storage with expiration (in-memory placeholder here;
  replace with Redis or a DB table before activation)
- Rate limiting / max retry enforcement
- Delegating actual delivery to the active SMS provider (services/sms/)

NOTE: This module intentionally does not send real SMS messages yet.
"""

import random
import string
import time
from typing import Dict, Tuple

from app.core.config import settings
from app.services.sms.factory import get_sms_provider

# Placeholder in-memory store: { phone_number: (code, expires_at, attempts) }
# Replace with Redis or a persistent store before production activation.
_otp_store: Dict[str, Tuple[str, float, int]] = {}


def generate_otp_code(length: int = 5) -> str:
    return "".join(random.choices(string.digits, k=length))


def request_otp(phone_number: str) -> None:
    code = generate_otp_code()
    expires_at = time.time() + settings.OTP_EXPIRE_SECONDS
    _otp_store[phone_number] = (code, expires_at, 0)

    provider = get_sms_provider()
    provider.send_otp(phone_number=phone_number, code=code)


def verify_otp(phone_number: str, code: str) -> bool:
    record = _otp_store.get(phone_number)
    if not record:
        return False

    stored_code, expires_at, attempts = record

    if attempts >= settings.OTP_MAX_RETRY:
        return False
    if time.time() > expires_at:
        return False

    if stored_code != code:
        _otp_store[phone_number] = (stored_code, expires_at, attempts + 1)
        return False

    del _otp_store[phone_number]
    return True
