"""Prompt Template endpoints."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.prompt_template import PromptTemplate
from app.schemas.prompt import PromptTemplateCreate, PromptTemplateRead

router = APIRouter()


@router.post("/", response_model=PromptTemplateRead, status_code=201)
def create_template(
    payload: PromptTemplateCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    template = PromptTemplate(**payload.model_dump())
    db.add(template)
    db.commit()
    db.refresh(template)
    return template


@router.get("/", response_model=list[PromptTemplateRead])
def list_templates(
    category: str | None = None,
    db: Session = Depends(get_db),
):
    query = db.query(PromptTemplate)
    if category:
        query = query.filter(PromptTemplate.category == category)
    return query.all()
