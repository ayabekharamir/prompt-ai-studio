"""Brand endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.brand import Brand
from app.schemas.brand import BrandCreate, BrandRead

router = APIRouter()


@router.post("/workspaces/{workspace_id}/brands", response_model=BrandRead, status_code=status.HTTP_201_CREATED)
def create_brand(
    workspace_id: str,
    payload: BrandCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    brand = Brand(workspace_id=workspace_id, **payload.model_dump())
    db.add(brand)
    db.commit()
    db.refresh(brand)
    return brand


@router.get("/workspaces/{workspace_id}/brands", response_model=list[BrandRead])
def list_brands(
    workspace_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return db.query(Brand).filter(Brand.workspace_id == workspace_id).all()


@router.get("/{brand_id}", response_model=BrandRead)
def get_brand(
    brand_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    brand = db.query(Brand).filter(Brand.id == brand_id).first()
    if not brand:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Brand not found")
    return brand
