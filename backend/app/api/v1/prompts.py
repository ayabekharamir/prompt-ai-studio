"""
Prompt endpoints.

Phase 1 scope: create, save, list and retrieve prompts built from templates
and brand context - no AI API is called here.

Phase 2B adds AI execution on top of that unchanged foundation: prompt
creation/list/get logic below is untouched. Execution logic (loading the
prompt/brand/brand-brain, calling the AI provider, recording history) lives
in app.services.prompt_execution_service and is only orchestrated here.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.prompt import PromptCreate, PromptRead, PromptUpdate
from app.schemas.prompt_execution import ExecutePromptRequest, PromptExecutionRead
from app.repositories.prompt_repository import PromptRepository
from app.repositories.prompt_execution_repository import PromptExecutionRepository
from app.services import prompt_execution_service
from app.services.prompt_execution_service import AIExecutionError, PromptNotFoundError
from app.schemas.prompt import PromptCreate, PromptRead, PromptUpdate
from app.schemas.prompt_build import BuildPromptRequest, BuildPromptResponse
from app.services import prompt_builder_service
from app.services.prompt_builder_service import (
    PromptBuilderNotFoundError,
    PromptBuilderValidationError,
)

router = APIRouter()


@router.post("/workspaces/{workspace_id}/prompts", response_model=PromptRead, status_code=status.HTTP_201_CREATED)
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


@router.get("/workspaces/{workspace_id}/prompts", response_model=list[PromptRead])
def list_prompts(
    workspace_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return PromptRepository(db).list_by_workspace(workspace_id)


@router.get("/{prompt_id}", response_model=PromptRead)
def get_prompt(
    prompt_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    prompt = PromptRepository(db).get(prompt_id)
    if not prompt:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prompt not found")
    return prompt


@router.put("/{prompt_id}", response_model=PromptRead)
def update_prompt(
    prompt_id: str,
    payload: PromptUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Partially update a prompt. Only fields present in the body are changed."""
    prompt = PromptRepository(db).get(prompt_id)
    if not prompt:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prompt not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(prompt, field, value)
    db.commit()
    db.refresh(prompt)
    return prompt


@router.delete("/{prompt_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_prompt(
    prompt_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a prompt and its AI execution history."""
    prompt_repo = PromptRepository(db)
    prompt = prompt_repo.get(prompt_id)
    if not prompt:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prompt not found")

    execution_repo = PromptExecutionRepository(db)
    for execution in execution_repo.list_by_prompt(prompt_id):
        execution_repo.delete(execution)

    prompt_repo.delete(prompt)
    return None


# --- AI Execution (Phase 2B) ---

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
    """
    Execute a saved prompt against an AI provider.

    Loads the prompt, its brand, and the brand's Brand Brain rules; injects
    them as system context; sends the request to the selected AI provider
    (payload.provider, else AI_PROVIDER from the environment); and stores +
    returns a PromptExecution history record.
    """
    try:
        return prompt_execution_service.execute_prompt(
            db=db,
            prompt_id=prompt_id,
            user_id=current_user.id,
            payload=payload,
        )
    except PromptNotFoundError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prompt not found")
    except AIExecutionError as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(exc))


@router.get("/{prompt_id}/executions", response_model=list[PromptExecutionRead])
def list_prompt_executions(
    prompt_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List AI execution history for a prompt, most recent first."""
    prompt = PromptRepository(db).get(prompt_id)
    if not prompt:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prompt not found")
    return PromptExecutionRepository(db).list_by_prompt(prompt_id)
