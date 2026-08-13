"""
Product Templates + Products endpoints.

A brand first defines a ProductTemplate (a reusable field schema for one
product category, e.g. "Tour Package"), then creates individual Products
against it. See app/services/product_service.py for authorization and
field-validation rules.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.product import ProductCreate, ProductRead, ProductUpdate
from app.schemas.product_template import (
    ProductTemplateCreate,
    ProductTemplateRead,
    ProductTemplateUpdate,
)
from app.services import product_service as svc

router = APIRouter()


def _handle_common_errors(exc: Exception):
    if isinstance(exc, svc.BrandNotFoundError):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Brand not found")
    if isinstance(exc, svc.BrandAccessDeniedError):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    if isinstance(exc, svc.TemplateNotFoundError):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product template not found")
    if isinstance(exc, svc.ProductNotFoundError):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    if isinstance(exc, svc.InvalidFieldValuesError):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    raise exc


# --- Product Templates ---------------------------------------------------

@router.post(
    "/brands/{brand_id}/product-templates",
    response_model=ProductTemplateRead,
    status_code=status.HTTP_201_CREATED,
)
def create_product_template(
    brand_id: str,
    payload: ProductTemplateCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return svc.create_product_template(
            db=db,
            brand_id=brand_id,
            user=current_user,
            name=payload.name,
            description=payload.description,
            fields=payload.fields,
        )
    except Exception as exc:
        _handle_common_errors(exc)


@router.get("/brands/{brand_id}/product-templates", response_model=list[ProductTemplateRead])
def list_product_templates(
    brand_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return svc.list_product_templates(db=db, brand_id=brand_id, user=current_user)
    except Exception as exc:
        _handle_common_errors(exc)


@router.patch("/product-templates/{template_id}", response_model=ProductTemplateRead)
def update_product_template(
    template_id: str,
    payload: ProductTemplateUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return svc.update_product_template(
            db=db,
            template_id=template_id,
            user=current_user,
            name=payload.name,
            description=payload.description,
            fields=payload.fields,
        )
    except Exception as exc:
        _handle_common_errors(exc)


@router.delete("/product-templates/{template_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product_template(
    template_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        svc.delete_product_template(db=db, template_id=template_id, user=current_user)
    except Exception as exc:
        _handle_common_errors(exc)
    return None


# --- Products --------------------------------------------------------------

@router.post(
    "/brands/{brand_id}/products",
    response_model=ProductRead,
    status_code=status.HTTP_201_CREATED,
)
def create_product(
    brand_id: str,
    payload: ProductCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return svc.create_product(
            db=db,
            brand_id=brand_id,
            user=current_user,
            template_id=str(payload.template_id),
            name=payload.name,
            field_values=payload.field_values,
        )
    except Exception as exc:
        _handle_common_errors(exc)


@router.get("/brands/{brand_id}/products", response_model=list[ProductRead])
def list_products(
    brand_id: str,
    template_id: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return svc.list_products(db=db, brand_id=brand_id, user=current_user, template_id=template_id)
    except Exception as exc:
        _handle_common_errors(exc)


@router.patch("/products/{product_id}", response_model=ProductRead)
def update_product(
    product_id: str,
    payload: ProductUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return svc.update_product(
            db=db,
            product_id=product_id,
            user=current_user,
            name=payload.name,
            field_values=payload.field_values,
        )
    except Exception as exc:
        _handle_common_errors(exc)


@router.delete("/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(
    product_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        svc.delete_product(db=db, product_id=product_id, user=current_user)
    except Exception as exc:
        _handle_common_errors(exc)
    return None
