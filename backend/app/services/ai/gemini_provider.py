"""
Google Gemini provider implementation.

Calls the Gemini "generateContent" REST API directly via httpx (same
approach already used elsewhere in this project for outbound HTTP calls),
so no extra SDK dependency is introduced.

Reference: https://ai.google.dev/api/generate-content
"""

from typing import Optional

import httpx

from app.core.config import settings
from app.services.ai.base import AIGenerationResult, AIProviderBase


class GeminiProvider(AIProviderBase):
    def __init__(self):
        self.api_key = settings.GOOGLE_AI_API_KEY
        self.default_model = settings.GOOGLE_AI_MODEL
        self.base_url = "https://generativelanguage.googleapis.com/v1beta"

    def generate_text(
        self,
        prompt: str,
        system: Optional[str] = None,
        model: Optional[str] = None,
        options: Optional[dict] = None,
    ) -> AIGenerationResult:
        if not self.api_key:
            raise ValueError(
                "GOOGLE_AI_API_KEY is not configured. Set it in the environment "
                "to use the Gemini provider."
            )

        model = model or self.default_model

        payload = {"contents": [{"role": "user", "parts": [{"text": prompt}]}]}
        if system:
            payload["systemInstruction"] = {"parts": [{"text": system}]}
        if options:
            payload["generationConfig"] = options

        url = f"{self.base_url}/models/{model}:generateContent"

        with httpx.Client(timeout=60.0) as client:
            response = client.post(
                url, params={"key": self.api_key}, json=payload
            )
        response.raise_for_status()
        data = response.json()

        text = ""
        candidates = data.get("candidates") or []
        if candidates:
            parts = (candidates[0].get("content") or {}).get("parts") or []
            text = "".join(part.get("text", "") for part in parts)

        usage = data.get("usageMetadata") or {}
        tokens_used = usage.get("totalTokenCount")

        return AIGenerationResult(text=text, model=model, tokens_used=tokens_used)
