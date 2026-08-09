"""
AI Provider interface.

Phase 2B: this interface is now ACTIVE. Any AI provider (OpenAI, Anthropic,
Gemini, ...) implements this interface, keeping provider-specific request/
response shapes out of services and API routes - callers only ever see
`generate_text()` and `AIGenerationResult`.
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Optional


@dataclass
class AIGenerationResult:
    """Normalized result of a text-generation call, regardless of provider."""

    text: str
    model: str
    tokens_used: Optional[int] = None


class AIProviderBase(ABC):
    """Abstract base class for AI text-generation providers."""

    @abstractmethod
    def generate_text(
        self,
        prompt: str,
        system: Optional[str] = None,
        model: Optional[str] = None,
        options: Optional[dict] = None,
    ) -> AIGenerationResult:
        """
        Generate text from a prompt.

        Args:
            prompt: The user-facing prompt/content to send to the model.
            system: Optional system-level context (e.g. Brand Brain injection).
            model: Optional model override; provider default is used if omitted.
            options: Optional provider-specific extra parameters
                (e.g. temperature, max_tokens).

        Returns:
            AIGenerationResult with the generated text, the model actually
            used, and token usage when the provider reports it.

        Raises:
            ValueError: if the provider is not configured (e.g. missing API key).
            Exception: provider/network errors are propagated to the caller,
                which is responsible for translating them into an HTTP response.
        """
        raise NotImplementedError
