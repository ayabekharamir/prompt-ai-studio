"""Pydantic schemas for Prompt Execution (AI generation runs)."""

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


class ExecutePromptRequest(BaseModel):
    """
    Request body for POST /prompts/{prompt_id}/execute.

    Every field is optional: with an empty body, the endpoint falls back to
    the AI_PROVIDER / <PROVIDER>_MODEL environment defaults.
    """

    provider: Optional[str] = Field(
        default=None,
        description="openai | anthropic | gemini. Defaults to the AI_PROVIDER environment setting.",
    )
    model: Optional[str] = Field(
        default=None,
        description="Override the model name for the chosen provider (e.g. 'gpt-4o').",
    )
    extra_input: Optional[str] = Field(
        default=None,
        description="Additional user input appended to the prompt's saved content before sending to the AI.",
    )
    options: Optional[dict] = Field(
        default=None,
        description="Provider-specific extra parameters (e.g. temperature, max_tokens).",
    )


class PromptExecutionRead(BaseModel):
    id: UUID
    prompt_id: UUID
    user_id: UUID
    model: str
    input_text: str
    output_text: Optional[str] = None
    tokens_used: Optional[int] = None
    status: str
    error_message: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}
