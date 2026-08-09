"""
AI provider factory.

Selects the active AI provider based on either an explicit override (e.g. a
`provider` field sent on a prompt-execution request) or the AI_PROVIDER
setting, so callers never import a concrete provider class directly.
"""

from typing import Optional

from app.core.config import settings
from app.services.ai.base import AIProviderBase

_SUPPORTED_PROVIDERS = {"openai", "anthropic", "gemini"}


def get_ai_provider(provider_name: Optional[str] = None) -> AIProviderBase:
    provider = (provider_name or settings.AI_PROVIDER or "none").strip().lower()

    if provider == "none":
        raise ValueError(
            "No AI provider is configured. Set AI_PROVIDER to one of "
            f"{sorted(_SUPPORTED_PROVIDERS)} (or pass `provider` explicitly "
            "in the request) and configure the matching API key."
        )

    if provider == "openai":
        from app.services.ai.openai_provider import OpenAIProvider

        return OpenAIProvider()

    if provider == "anthropic":
        from app.services.ai.anthropic_provider import AnthropicProvider

        return AnthropicProvider()

    if provider in ("gemini", "google", "google_ai"):
        from app.services.ai.gemini_provider import GeminiProvider

        return GeminiProvider()

    raise ValueError(
        f"Unsupported AI_PROVIDER: '{provider}'. Supported providers: "
        f"{sorted(_SUPPORTED_PROVIDERS)}."
    )
