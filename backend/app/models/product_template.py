"""
Product Template model: a brand-defined, reusable field schema for one
category of products (e.g. "Tour Package" vs "Accommodation"). A brand
defines the template once, then creates individual Products against it.

`fields` is a JSON array of field definitions.
"""

from sqlalchemy import Column, String, Text, ForeignKey
from app.core.types import JSONType
from sqlalchemy.orm import relationship

from app.core.types import GUID
from app.models.base import BaseModel


class ProductTemplate(BaseModel):
    __tablename__ = "product_templates"

    brand_id = Column(
        GUID(),
        ForeignKey("brands.id"),
        nullable=False,
        index=True,
    )

    name = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    fields = Column(JSONType(), nullable=False, default=list)

    brand = relationship("Brand", back_populates="product_templates")

    products = relationship(
        "Product",
        back_populates="template",
        cascade="all, delete-orphan",
    )
