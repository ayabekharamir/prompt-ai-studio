"""
Prompt endpoints.

Handles:
- Prompt CRUD
- AI Execution
- Deterministic Prompt Builder (No AI)

Prompt Builder creates final prompt text only.
No AI provider is called here.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user

from app.models.user import User

from app.schemas.prompt import (
    PromptCreate,
    PromptRead,
    PromptUpdate,
)

from app.schemas.prompt_execution import (
    ExecutePromptRequest,
    PromptExecutionRead,
)

from app.schemas.prompt_build import (
    BuildPromptRequest,
    BuildPromptResponse,
)

from app.repositories.prompt_repository import PromptRepository
from app.repositories.prompt_execution_repository import (
    PromptExecutionRepository,
)

from app.services import prompt_execution_service
from app.services import prompt_builder_service

from app.services.prompt_execution_service import (
    AIExecutionError,
    PromptNotFoundError,
)

from app.services.prompt_builder_service import (
    PromptBuilderNotFoundError,
    PromptBuilderValidationError,
)


router = APIRouter()


# ------------------------------------------------------------------
# Prompt CRUD
# ------------------------------------------------------------------


@router.post(
    "/workspaces/{workspace_id}/prompts",
    response_model=PromptRead,
    status_code=status.HTTP_201_CREATED,
)
def create_prompt(
    workspace_id: str,
    payload: PromptCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return PromptRepository(db).create(
        workspace_id=workspace_id,
        created_by=current_user.id,
        **payload.model_dump(),
    )


@router.get(
    "/workspaces/{workspace_id}/prompts",
    response_model=list[PromptRead],
)
def list_prompts(
    workspace_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return PromptRepository(db).list_by_workspace(workspace_id)


@router.get(
    "/{prompt_id}",
    response_model=PromptRead,
)
def get_prompt(
    prompt_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    prompt = PromptRepository(db).get(prompt_id)

    if not prompt:
        raise HTTPException(
            status_code=404,
            detail="Prompt not found",
        )

    return prompt


@router.put(
    "/{prompt_id}",
    response_model=PromptRead,
)
def update_prompt(
    prompt_id: str,
    payload: PromptUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    prompt = PromptRepository(db).get(prompt_id)

    if not prompt:
        raise HTTPException(
            status_code=404,
            detail="Prompt not found",
        )

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(prompt, field, value)

    db.commit()
    db.refresh(prompt)

    return prompt


@router.delete(
    "/{prompt_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_prompt(
    prompt_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    prompt_repo = PromptRepository(db)
    prompt = prompt_repo.get(prompt_id)

    if not prompt:
        raise HTTPException(
            status_code=404,
            detail="Prompt not found",
        )

    execution_repo = PromptExecutionRepository(db)

    for execution in execution_repo.list_by_prompt(prompt_id):
        execution_repo.delete(execution)

    prompt_repo.delete(prompt)

    return None


# ------------------------------------------------------------------
# Deterministic Prompt Builder (NO AI)
# ------------------------------------------------------------------


@router.post(
    "/build",
    response_model=BuildPromptResponse,
)
def build_prompt_without_ai(
    payload: BuildPromptRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        content = prompt_builder_service.build_prompt(
            db=db,
            brand_id=str(payload.brand_id),
            task=payload.task,
            prompt_template_id=(
                str(payload.prompt_template_id)
                if payload.prompt_template_id
                else None
            ),
            product_id=(
                str(payload.product_id)
                if payload.product_id
                else None
            ),
            persona_id=(
                str(payload.persona_id)
                if payload.persona_id
                else None
            ),
            extra_context=payload.extra_context,
        )

        return BuildPromptResponse(
            title=payload.title or "Generated Prompt",
            content=content,
            brand_id=payload.brand_id,
            product_id=payload.product_id,
            persona_id=payload.persona_id,
            prompt_template_id=payload.prompt_template_id,
        )

    except PromptBuilderNotFoundError as exc:
        raise HTTPException(
            status_code=404,
            detail=str(exc),
        )

    except PromptBuilderValidationError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        )


# ------------------------------------------------------------------
# AI Execution
# ------------------------------------------------------------------


@router.post(
    "/{prompt_id}/execute",
    response_model=PromptExecutionRead,
    status_code=status.HTTP_201_CREATED,
)
def execute_prompt(
    prompt_id: str,
    payload: ExecutePromptRequest = ExecutePromptRequest(),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return prompt_execution_service.execute_prompt(
            db=db,
            prompt_id=prompt_id,
            user_id=current_user.id,
            payload=payload,
        )

    except PromptNotFoundError:
        raise HTTPException(
            status_code=404,
            detail="Prompt not found",
        )

    except AIExecutionError as exc:
        raise HTTPException(
            status_code=502,
            detail=str(exc),
        )


@router.get(
    "/{prompt_id}/executions",
    response_model=list[PromptExecutionRead],
)
def list_prompt_executions(
    prompt_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    prompt = PromptRepository(db).get(prompt_id)

    if not prompt:
        raise HTTPException(
            status_code=404,
            detail="Prompt not found",
        )

    return PromptExecutionRepository(db).list_by_prompt(prompt_id)
