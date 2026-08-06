"""
SMS provider factory.
Selects the active SMS provider based on SMS_PROVIDER setting,
so new providers can be added without touching calling code.
"""

from app.core.config import settings
from app.services.sms.base import SMSProviderBase
from app.services.sms.sms_ir import SMSIrProvider


def get_sms_provider() -> SMSProviderBase:
    provider = settings.SMS_PROVIDER

    if provider == "sms_ir":
        return SMSIrProvider()

    # Future providers (Kavenegar, Twilio, etc.) can be registered here.
    raise ValueError(f"Unsupported SMS_PROVIDER: '{provider}'")
