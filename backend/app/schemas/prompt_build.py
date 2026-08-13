"""
Schemas for building a prompt without using an AI provider.

The Build Prompt flow combines existing application data such as:
- Brand
- Brand Brain
- Brand Rules
- Product Template
- Product
- Persona Template
- Persona
- Prompt Template

No AI provider is called by this schema or by the build endpoint.
"""

from typing import Any, Dict, Optional
from uuid import UUID

from pydantic import BaseModel, Field


class BuildPromptRequest(BaseModel):
    """
    Input for the deterministic, no-AI prompt builder.

    Only IDs and user-provided task information are accepted here.
    The backend is responsible for loading the actual data and enforcing
    authorization.
    """

    brand_id: UUID = Field(
        ...,
        description="Brand whose Brand Brain and rules should be used.",
    )

    product_id: Optional[UUID] = Field(
        default=None,
        description="Optional product to include in the final prompt.",
    )

    persona_id: Optional[UUID] = Field(
        default=None,
        description="Optional brand persona to include in the final prompt.",
    )

    prompt_template_id: Optional[UUID] = Field(
        default=None,
        description="Optional prompt template to use as the task skeleton.",
    )

    title: Optional[str] = Field(
        default=None,
        description="Optional title for the generated prompt.",
        max_length=200,
    )

    task: str = Field(
        ...,
        min_length=1,
        description="The actual task/instruction the AI should perform.",
    )

    extra_context: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Optional additional structured context supplied by the user.",
    )


class BuildPromptResponse(BaseModel):
    """
    Result of the deterministic prompt-building process.

    The generated content is plain text and can later be:
    - copied,
    - edited,
    - saved as a Prompt,
    - sent to AI Execution.
    """

    title: str
    content: str

    brand_id: UUID
    product_id: Optional[UUID] = None
    persona_id: Optional[UUID] = None
    prompt_template_id: Optional[UUID] = None

    model_config = {"from_attributes": True}
