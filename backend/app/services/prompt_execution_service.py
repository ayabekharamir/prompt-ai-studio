"""
Prompt Execution service.

Orchestrates AI execution for a saved Prompt:
1. Load the prompt.
2. Load its related brand (if any).
3. Load the brand's identity + rules ("Brand Brain").
4. Build an AI system context from that Brand Brain data.
5. Send the request to the selected AI provider.
6. Persist a PromptExecution history record and return it.

This does not touch prompt creation/list/get logic in prompts.py - it only
reads an existing Prompt and writes to the new prompt_executions table.
"""

from typing import Optional
from uuid import UUID

from sqlalchemy.orm import Session

from app.models.brand import Brand
from app.models.brand_identity import BrandIdentity
from app.models.brand_rules import BrandRule
from app.models.prompt_execution import PromptExecution
from app.repositories.brand_repository import (
    BrandIdentityRepository,
    BrandRepository,
    BrandRuleRepository,
)
from app.repositories.prompt_execution_repository import PromptExecutionRepository
from app.repositories.prompt_repository import PromptRepository
from app.schemas.prompt_execution import ExecutePromptRequest
from app.services.ai.factory import get_ai_provider


class PromptNotFoundError(Exception):
    """Raised when the target prompt does not exist."""


class AIExecutionError(Exception):
    """Raised when the AI provider is misconfigured or the call fails."""


def _build_system_context(
    brand: Optional[Brand],
    identity: Optional[BrandIdentity],
    rules: list[BrandRule],
) -> Optional[str]:
    """
    Build the "Brand Brain" system context injected ahead of every AI call.

    Mirrors the shape requested in Phase 2B:

        System Context:
        Brand:
        <brand name>
        Rules:
        - <rule 1>
        - <rule 2>
    """
    if not brand:
        return None

    lines = ["Brand:", brand.name]
    if brand.description:
        lines.append(brand.description)

    if identity:
        if identity.tone_of_voice:
            lines.append(f"Tone of voice: {identity.tone_of_voice}")
        if identity.mission:
            lines.append(f"Mission: {identity.mission}")
        if identity.target_audience:
            lines.append(f"Target audience: {identity.target_audience}")
        if identity.brand_personality:
            lines.append(f"Brand personality: {identity.brand_personality}")
        if identity.core_values:
            lines.append(f"Core values: {identity.core_values}")
        if identity.unique_selling_point:
            lines.append(f"Unique selling point: {identity.unique_selling_point}")

    if rules:
        lines.append("Rules:")
        for rule in rules:
            rule_line = f"- {rule.title}"
            if rule.description:
                rule_line += f": {rule.description}"
            lines.append(rule_line)

    return "\n".join(lines)


def execute_prompt(
    db: Session,
    prompt_id: str,
    user_id: UUID,
    payload: ExecutePromptRequest,
) -> PromptExecution:
    # 1. Load existing prompt
    prompt = PromptRepository(db).get(prompt_id)
    if not prompt:
        raise PromptNotFoundError(f"Prompt '{prompt_id}' not found")

    # 2 & 3. Load related brand + brand brain rules
    brand: Optional[Brand] = None
    identity: Optional[BrandIdentity] = None
    rules: list[BrandRule] = []
    if prompt.brand_id:
        brand = BrandRepository(db).get(prompt.brand_id)
        if brand:
            identity = BrandIdentityRepository(db).get_by_brand(brand.id)
            rules = BrandRuleRepository(db).list_by_brand(brand.id)

    # 4. Build AI system context (Brand Brain injection)
    system_context = _build_system_context(brand, identity, rules)

    input_text = prompt.content
    if payload.extra_input:
        input_text = f"{input_text}\n\n{payload.extra_input}"

    execution_repo = PromptExecutionRepository(db)

    # Resolve provider before attempting the call - a config error (e.g. no
    # AI_PROVIDER set, missing API key) is not worth recording as a history
    # row since no call was actually attempted.
    try:
        provider = get_ai_provider(payload.provider)
    except ValueError as exc:
        raise AIExecutionError(str(exc)) from exc

    # 5. Send request to selected AI provider
    try:
        result = provider.generate_text(
            prompt=input_text,
            system=system_context,
            model=payload.model,
            options=payload.options,
        )
    except Exception as exc:
        # Record the failed attempt for audit/history, then surface the error.
        execution_repo.create(
            prompt_id=prompt.id,
            user_id=user_id,
            model=payload.model or "unknown",
            input_text=input_text,
            output_text=None,
            tokens_used=None,
            status="failed",
            error_message=str(exc),
        )
        raise AIExecutionError(f"AI provider call failed: {exc}") from exc

    # 6. Persist execution history and return the result
    return execution_repo.create(
        prompt_id=prompt.id,
        user_id=user_id,
        model=result.model,
        input_text=input_text,
        output_text=result.text,
        tokens_used=result.tokens_used,
        status="completed",
    )
