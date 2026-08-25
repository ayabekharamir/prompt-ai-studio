"""
Product model: a single product/service belonging to a brand, created
from one of that brand's ProductTemplates.
"""

from sqlalchemy import Column, String, ForeignKey
from app.core.types import JSONType
from sqlalchemy.orm import relationship

from app.core.types import GUID
from app.models.base import BaseModel


class Product(BaseModel):
    __tablename__ = "products"

    brand_id = Column(
        GUID(),
        ForeignKey("brands.id"),
        nullable=False,
        index=True,
    )

    template_id = Column(
        GUID(),
        ForeignKey("product_templates.id"),
        nullable=False,
        index=True,
    )

    name = Column(String(200), nullable=False)
    field_values = Column(JSONType(), nullable=False, default=dict)

    brand = relationship("Brand", back_populates="products")

    template = relationship(
        "ProductTemplate",
        back_populates="products",
    )

