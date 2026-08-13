"""
Product model: a single product/service belonging to a brand, created
from one of that brand's ProductTemplates. `field_values` stores the
actual data keyed by the template's field `key`s, e.g.:

    {"destination": "Kish Island", "price": 4500000, "duration_days": 3}

`name` is kept as its own column (not just another field_values entry)
because every product needs a short display name regardless of which
template/category it belongs to - used in lists, the asset/product
picker inside the Prompt Generator, etc.
"""

from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import relationship

from app.models.base import BaseModel


class Product(BaseModel):
    __tablename__ = "products"

    brand_id = Column(UUID(as_uuid=True), ForeignKey("brands.id"), nullable=False, index=True)
    template_id = Column(
        UUID(as_uuid=True), ForeignKey("product_templates.id"), nullable=False, index=True
    )

    name = Column(String(200), nullable=False)
    field_values = Column(JSONB, nullable=False, default=dict)

    brand = relationship("Brand", back_populates="products")
    template = relationship("ProductTemplate", back_populates="products")
