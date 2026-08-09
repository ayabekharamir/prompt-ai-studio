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
    BrandRuleUpdate,
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


@router.put("/rules/{rule_id}", response_model=BrandRuleRead)
def update_brand_rule(
    rule_id: str,
    payload: BrandRuleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Partially update a brand rule. Only fields present in the body are changed."""
    repo = BrandRuleRepository(db)
    rule = repo.get(rule_id)
    if not rule:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Brand rule not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(rule, field, value)
    db.commit()
    db.refresh(rule)
    return rule


@router.delete("/rules/{rule_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_brand_rule(
    rule_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    repo = BrandRuleRepository(db)
    rule = repo.get(rule_id)
    if not rule:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Brand rule not found")
    repo.delete(rule)
    return None
