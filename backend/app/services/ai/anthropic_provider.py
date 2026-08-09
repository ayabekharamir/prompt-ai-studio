"""
Anthropic provider implementation.

Calls the Anthropic Messages REST API directly via httpx (same approach
already used elsewhere in this project for outbound HTTP calls), so no extra
SDK dependency is introduced.

Reference: https://docs.claude.com/en/api/messages
"""

from typing import Optional

import httpx

from app.core.config import settings
from app.services.ai.base import AIGenerationResult, AIProviderBase


class AnthropicProvider(AIProviderBase):
    def __init__(self):
        self.api_key = settings.ANTHROPIC_API_KEY
        self.default_model = settings.ANTHROPIC_MODEL
        self.base_url = "https://api.anthropic.com/v1"
        self.api_version = "2023-06-01"

    def generate_text(
        self,
        prompt: str,
        system: Optional[str] = None,
        model: Optional[str] = None,
        options: Optional[dict] = None,
    ) -> AIGenerationResult:
        if not self.api_key:
            raise ValueError(
                "ANTHROPIC_API_KEY is not configured. Set it in the environment "
                "to use the Anthropic provider."
            )

        model = model or self.default_model
        options = options or {}

        payload = {
            "model": model,
            "max_tokens": options.get("max_tokens", 1024),
            "messages": [{"role": "user", "content": prompt}],
        }
        if system:
            payload["system"] = system
        for key, value in options.items():
            if key != "max_tokens":
                payload[key] = value

        headers = {
            "x-api-key": self.api_key,
            "anthropic-version": self.api_version,
            "Content-Type": "application/json",
        }

        with httpx.Client(timeout=60.0) as client:
            response = client.post(
                f"{self.base_url}/messages", json=payload, headers=headers
            )
        response.raise_for_status()
        data = response.json()

        text = "".join(
            block.get("text", "")
            for block in data.get("content", [])
            if block.get("type") == "text"
        )
        usage = data.get("usage") or {}
        tokens_used = None
        if usage:
            tokens_used = usage.get("input_tokens", 0) + usage.get("output_tokens", 0)

        return AIGenerationResult(text=text, model=model, tokens_used=tokens_used)
