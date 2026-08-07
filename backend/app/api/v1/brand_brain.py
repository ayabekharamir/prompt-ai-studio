"""
Brand Brain endpoints.
Manages Brand Identity (descriptive info) and Brand Rules (guardrails)
that together form a brand's "Brand Brain" - the structured knowledge
base used later to generate on-brand prompts.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.brand import (
    BrandIdentityCreate,
    BrandIdentityRead,
    BrandRuleCreate,
    BrandRuleRead,
)
from app.repositories.brand_repository import BrandIdentityRepository, BrandRuleRepository

router = APIRouter()


# --- Brand Identity ---

@router.put("/{brand_id}/identity", response_model=BrandIdentityRead)
def upsert_brand_identity(
    brand_id: str,
    payload: BrandIdentityCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    repo = BrandIdentityRepository(db)
    identity = repo.get_by_brand(brand_id)
    if identity:
        for field, value in payload.model_dump().items():
            setattr(identity, field, value)
        db.commit()
        db.refresh(identity)
    else:
        identity = repo.create(brand_id=brand_id, **payload.model_dump())

    return identity


@router.get("/{brand_id}/identity", response_model=BrandIdentityRead)
def get_brand_identity(
    brand_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    identity = BrandIdentityRepository(db).get_by_brand(brand_id)
    if not identity:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Brand identity not set yet")
    return identity


# --- Brand Rules ---

@router.post("/{brand_id}/rules", response_model=BrandRuleRead, status_code=status.HTTP_201_CREATED)
def create_brand_rule(
    brand_id: str,
    payload: BrandRuleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return BrandRuleRepository(db).create(brand_id=brand_id, **payload.model_dump())


@router.get("/{brand_id}/rules", response_model=list[BrandRuleRead])
def list_brand_rules(
    brand_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return BrandRuleRepository(db).list_by_brand(brand_id)
