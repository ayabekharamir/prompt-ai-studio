"""Prompt Template endpoints."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.prompt import PromptTemplateCreate, PromptTemplateRead
from app.repositories.prompt_repository import PromptTemplateRepository

router = APIRouter()


@router.post("/", response_model=PromptTemplateRead, status_code=201)
def create_template(
    payload: PromptTemplateCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return PromptTemplateRepository(db).create(**payload.model_dump())


@router.get("/", response_model=list[PromptTemplateRead])
def list_templates(
    category: str | None = None,
    db: Session = Depends(get_db),
):
    return PromptTemplateRepository(db).list(category=category)
