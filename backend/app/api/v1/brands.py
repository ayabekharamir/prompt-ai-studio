"""Brand endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.brand import BrandCreate, BrandRead, BrandUpdate
from app.repositories.brand_repository import BrandRepository

router = APIRouter()


@router.post("/workspaces/{workspace_id}/brands", response_model=BrandRead, status_code=status.HTTP_201_CREATED)
def create_brand(
    workspace_id: str,
    payload: BrandCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return BrandRepository(db).create(workspace_id=workspace_id, **payload.model_dump())


@router.get("/workspaces/{workspace_id}/brands", response_model=list[BrandRead])
def list_brands(
    workspace_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return BrandRepository(db).list_by_workspace(workspace_id)


@router.get("/{brand_id}", response_model=BrandRead)
def get_brand(
    brand_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    brand = BrandRepository(db).get(brand_id)
    if not brand:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Brand not found")
    return brand


@router.put("/{brand_id}", response_model=BrandRead)
def update_brand(
    brand_id: str,
    payload: BrandUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    repo = BrandRepository(db)
    brand = repo.get(brand_id)
    if not brand:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Brand not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(brand, field, value)
    db.commit()
    db.refresh(brand)
    return brand


@router.delete("/{brand_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_brand(
    brand_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    repo = BrandRepository(db)
    brand = repo.get(brand_id)
    if not brand:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Brand not found")
    repo.delete(brand)
    return None
