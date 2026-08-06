"""
AI Provider interface (FUTURE INTEGRATION - NOT ACTIVE IN PHASE 1).

Prompt AI Studio's first version does NOT call any AI API.
This interface only prepares the architecture so that OpenAI, Anthropic,
or any other provider can be plugged in later without changing business logic.
"""

from abc import ABC, abstractmethod
from typing import Optional


class AIProviderBase(ABC):
    """Abstract base class for future AI text-generation providers."""

    @abstractmethod
    def generate_text(self, prompt: str, options: Optional[dict] = None) -> str:
        """Generate text from a prompt. Must be implemented by concrete providers."""
        raise NotImplementedError
