"""
SMS.ir provider implementation.

IMPORTANT: This is an architecture placeholder for Phase 1.
No real HTTP calls are made yet. Credentials are read from environment
variables only - never hard-code them here.

Reference (for future activation): https://sms.ir - REST API v1
"""

from app.core.config import settings
from app.services.sms.base import SMSProviderBase


class SMSIrProvider(SMSProviderBase):
    def __init__(self):
        self.api_key = settings.SMS_API_KEY
        self.template_id = settings.SMS_TEMPLATE_ID
        self.sender_number = settings.SMS_SENDER_NUMBER
        self.base_url = "https://api.sms.ir/v1"

    def send_otp(self, phone_number: str, code: str) -> bool:
        # TODO (future activation): call SMS.ir "verify" endpoint using
        # httpx.post(f"{self.base_url}/send/verify", ...) with self.api_key
        # and self.template_id. Left unimplemented by design for Phase 1.
        print(f"[SMS.ir - MOCK] OTP '{code}' would be sent to {phone_number}")
        return True

    def send_message(self, phone_number: str, message: str) -> bool:
        # TODO (future activation): call SMS.ir "send/bulk" or "send/single" endpoint.
        print(f"[SMS.ir - MOCK] Message would be sent to {phone_number}: {message}")
        return True
