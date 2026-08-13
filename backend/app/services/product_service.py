"""
Product Template + Product service.

Orchestrates:
1. Authorization - same brand/workspace-membership check used by
   brand_asset_service.py: a brand's templates/products may only be
   read/written by a user who belongs to the brand's workspace.
2. Field validation - a Product's field_values are checked against its
   ProductTemplate's `fields` schema (required fields present, no
   unknown keys) whenever a Product is created or its field_values are
   updated. The template's `fields` schema itself is only checked for
   structural validity (done by the FieldDefinition pydantic schema) -
   business rules like "at least one field" are intentionally not
   enforced here, brands may start with an empty template.
"""

from typing import Any, Dict, List, Optional

from sqlalchemy.orm import Session

from app.models.brand import Brand
from app.models.product import Product
from app.models.product_template import ProductTemplate
from app.models.user import User
from app.repositories.brand_repository import BrandRepository
from app.repositories.product_repository import ProductRepository
from app.repositories.product_template_repository import ProductTemplateRepository
from app.repositories.workspace_repository import WorkspaceRepository


class BrandNotFoundError(Exception):
    """Raised when the target brand does not exist."""


class BrandAccessDeniedError(Exception):
    """Raised when the current user does not belong to the brand's workspace."""


class TemplateNotFoundError(Exception):
    """Raised when the target product template does not exist."""


class ProductNotFoundError(Exception):
    """Raised when the target product does not exist."""


class InvalidFieldValuesError(Exception):
    """Raised when field_values don't match the product's template schema."""


def _ensure_brand_access(db: Session, brand_id: str, user: User) -> Brand:
    brand = BrandRepository(db).get(brand_id)
    if brand is None:
        raise BrandNotFoundError(f"Brand not found: {brand_id}")

    if not WorkspaceRepository(db).is_member(brand.workspace_id, user.id):
        raise BrandAccessDeniedError("You do not have access to this brand's workspace.")

    return brand


def _validate_field_values(template: ProductTemplate, field_values: Dict[str, Any]) -> None:
    known_keys = {f["key"] for f in template.fields}
    unknown = set(field_values.keys()) - known_keys
    if unknown:
        raise InvalidFieldValuesError(f"Unknown field(s) for this template: {', '.join(sorted(unknown))}")

    missing_required = [
        f["key"]
        for f in template.fields
        if f.get("required") and not str(field_values.get(f["key"], "")).strip()
    ]
    if missing_required:
        raise InvalidFieldValuesError(
            f"Missing required field(s): {', '.join(missing_required)}"
        )


# --- Product Templates --------------------------------------------------

def list_product_templates(db: Session, brand_id: str, user: User) -> List[ProductTemplate]:
    _ensure_brand_access(db, brand_id, user)
    return ProductTemplateRepository(db).list_by_brand(brand_id)


def create_product_template(
    db: Session, brand_id: str, user: User, name: str, description: Optional[str], fields: list
) -> ProductTemplate:
    _ensure_brand_access(db, brand_id, user)
    template = ProductTemplate(
        brand_id=brand_id,
        name=name,
        description=description,
        fields=[f.model_dump() if hasattr(f, "model_dump") else f for f in fields],
    )
    db.add(template)
    db.commit()
    db.refresh(template)
    return template


def _get_owned_template(db: Session, template_id: str, user: User) -> ProductTemplate:
    template = ProductTemplateRepository(db).get(template_id)
    if template is None:
        raise TemplateNotFoundError(f"Product template not found: {template_id}")
    _ensure_brand_access(db, str(template.brand_id), user)
    return template


def update_product_template(
    db: Session,
    template_id: str,
    user: User,
    name: Optional[str],
    description: Optional[str],
    fields: Optional[list],
) -> ProductTemplate:
    template = _get_owned_template(db, template_id, user)
    if name is not None:
        template.name = name
    if description is not None:
        template.description = description
    if fields is not None:
        template.fields = [f.model_dump() if hasattr(f, "model_dump") else f for f in fields]
    db.commit()
    db.refresh(template)
    return template


def delete_product_template(db: Session, template_id: str, user: User) -> None:
    template = _get_owned_template(db, template_id, user)
    db.delete(template)  # cascades to Product rows via the relationship
    db.commit()


# --- Products -------------------------------------------------------------

def list_products(
    db: Session, brand_id: str, user: User, template_id: Optional[str] = None
) -> List[Product]:
    _ensure_brand_access(db, brand_id, user)
    return ProductRepository(db).list_by_brand(brand_id, template_id=template_id)


def create_product(
    db: Session,
    brand_id: str,
    user: User,
    template_id: str,
    name: str,
    field_values: Dict[str, Any],
) -> Product:
    _ensure_brand_access(db, brand_id, user)

    template = ProductTemplateRepository(db).get(template_id)
    if template is None or str(template.brand_id) != str(brand_id):
        raise TemplateNotFoundError(f"Product template not found for this brand: {template_id}")

    _validate_field_values(template, field_values)

    product = Product(
        brand_id=brand_id,
        template_id=template_id,
        name=name,
        field_values=field_values,
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


def _get_owned_product(db: Session, product_id: str, user: User) -> Product:
    product = ProductRepository(db).get(product_id)
    if product is None:
        raise ProductNotFoundError(f"Product not found: {product_id}")
    _ensure_brand_access(db, str(product.brand_id), user)
    return product


def update_product(
    db: Session,
    product_id: str,
    user: User,
    name: Optional[str],
    field_values: Optional[Dict[str, Any]],
) -> Product:
    product = _get_owned_product(db, product_id, user)

    if field_values is not None:
        template = ProductTemplateRepository(db).get(product.template_id)
        _validate_field_values(template, field_values)
        product.field_values = field_values

    if name is not None:
        product.name = name

    db.commit()
    db.refresh(product)
    return product


def delete_product(db: Session, product_id: str, user: User) -> None:
    product = _get_owned_product(db, product_id, user)
    db.delete(product)
    db.commit()
