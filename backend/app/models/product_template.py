"""
Product Template model: a brand-defined, reusable field schema for one
category of products (e.g. "Tour Package" vs "Accommodation"). A brand
defines the template once, then creates individual Products against it.

`fields` is a JSON array of field definitions, e.g.:

    [
      {"key": "destination", "label": "Destination", "type": "text", "required": true},
      {"key": "price", "label": "Price", "type": "number", "required": false},
      {"key": "duration_days", "label": "Duration (days)", "type": "number"},
      {"key": "highlights", "label": "Highlights", "type": "textarea"}
    ]

Supported field "type" values: text, textarea, number, image, select
(see app/schemas/product_template.py for the validated set). Validation
of individual field definitions and of Product.field_values against
this schema happens in app/services/product_service.py - the DB column
itself is intentionally schema-less JSON so brands can define arbitrary
categories without a migration per category.
"""

from sqlalchemy import Column, String, Text, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import relationship

from app.models.base import BaseModel


class ProductTemplate(BaseModel):
    __tablename__ = "product_templates"

    brand_id = Column(UUID(as_uuid=True), ForeignKey("brands.id"), nullable=False, index=True)

    name = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    fields = Column(JSONB, nullable=False, default=list)

    brand = relationship("Brand", back_populates="product_templates")
    products = relationship(
        "Product", back_populates="template", cascade="all, delete-orphan"
    )
