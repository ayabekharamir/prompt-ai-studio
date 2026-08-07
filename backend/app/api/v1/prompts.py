"""
Prompt endpoints.

Phase 1 scope: create, save, list and retrieve prompts built from templates
and brand context. No AI API is called here - "generation" in Phase 1 means
assembling the final prompt text from a template + brand brain + user input,
not producing AI output.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.prompt import PromptCreate, PromptRead
from app.repositories.prompt_repository import PromptRepository

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
