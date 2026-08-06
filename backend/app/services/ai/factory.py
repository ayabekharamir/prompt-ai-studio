"""
AI provider factory (FUTURE INTEGRATION - NOT ACTIVE IN PHASE 1).

When AI_PROVIDER is "none" (the Phase 1 default), no provider is instantiated
and AI-dependent endpoints must not be exposed to users yet.
"""

from typing import Optional

from app.core.config import settings
from app.services.ai.base import AIProviderBase


def get_ai_provider() -> Optional[AIProviderBase]:
    provider = settings.AI_PROVIDER

    if provider == "none":
        return None

    # Future providers, e.g.:
    # if provider == "openai":
    #     from app.services.ai.openai_provider import OpenAIProvider
    #     return OpenAIProvider()
    # if provider == "anthropic":
    #     from app.services.ai.anthropic_provider import AnthropicProvider
    #     return AnthropicProvider()

    raise ValueError(f"Unsupported AI_PROVIDER: '{provider}'")
