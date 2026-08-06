"""
SMS Provider interface.
Any SMS provider (SMS.ir, Kavenegar, Twilio, etc.) must implement this interface.
This keeps the SMS integration fully replaceable.
"""

from abc import ABC, abstractmethod


class SMSProviderBase(ABC):
    """Abstract base class for SMS providers."""

    @abstractmethod
    def send_otp(self, phone_number: str, code: str) -> bool:
        """Send an OTP code to the given phone number. Returns True on success."""
        raise NotImplementedError

    @abstractmethod
    def send_message(self, phone_number: str, message: str) -> bool:
        """Send a generic text message. Returns True on success."""
        raise NotImplementedError
