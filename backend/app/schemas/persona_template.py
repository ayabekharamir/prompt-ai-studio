"""Pydantic schemas for Product Templates."""

from typing import List, Literal, Optional
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, Field

FieldType = Literal["text", "textarea", "number", "image", "select"]


class FieldDefinition(BaseModel):
    """One field in a ProductTemplate/PersonaTemplate's `fields` schema."""

    key: str = Field(..., description="Stable machine key, e.g. 'price'. Used as the lookup key in field_values.")
    label: str = Field(..., description="Human-readable label shown in the UI, e.g. 'Price'.")
    type: FieldType = "text"
    required: bool = False
    options: Optional[List[str]] = None  # only meaningful when type == "select"


class ProductTemplateBase(BaseModel):
    name: str
    description: Optional[str] = None
    fields: List[FieldDefinition] = []


class ProductTemplateCreate(ProductTemplateBase):
    pass


class ProductTemplateUpdate(BaseModel):
    """Partial update - only fields provided are changed."""

    name: Optional[str] = None
    description: Optional[str] = None
    fields: Optional[List[FieldDefinition]] = None


class ProductTemplateRead(ProductTemplateBase):
    id: UUID
    brand_id: UUID
    created_at: datetime

    model_config = {"from_attributes": True}
