"""
OpenAI provider implementation.

Calls the OpenAI Chat Completions REST API directly via httpx (same approach
already used elsewhere in this project for outbound HTTP calls), so no extra
SDK dependency is introduced.

Reference: https://platform.openai.com/docs/api-reference/chat
"""

from typing import Optional

import httpx

from app.core.config import settings
from app.services.ai.base import AIGenerationResult, AIProviderBase


class OpenAIProvider(AIProviderBase):
    def __init__(self):
        self.api_key = settings.OPENAI_API_KEY
        self.default_model = settings.OPENAI_MODEL
        self.base_url = "https://api.openai.com/v1"

    def generate_text(
        self,
        prompt: str,
        system: Optional[str] = None,
        model: Optional[str] = None,
        options: Optional[dict] = None,
    ) -> AIGenerationResult:
        if not self.api_key:
            raise ValueError(
                "OPENAI_API_KEY is not configured. Set it in the environment "
                "to use the OpenAI provider."
            )

        model = model or self.default_model

        messages = []
        if system:
            messages.append({"role": "system", "content": system})
        messages.append({"role": "user", "content": prompt})

        payload = {"model": model, "messages": messages}
        if options:
            payload.update(options)

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

        with httpx.Client(timeout=60.0) as client:
            response = client.post(
                f"{self.base_url}/chat/completions", json=payload, headers=headers
            )
        response.raise_for_status()
        data = response.json()

        text = data["choices"][0]["message"]["content"]
        tokens_used = (data.get("usage") or {}).get("total_tokens")

        return AIGenerationResult(text=text, model=model, tokens_used=tokens_used)
