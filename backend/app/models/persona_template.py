"""
Persona Template model: a brand-defined, reusable field schema for one
category of brand persona.
"""

from sqlalchemy import Column, String, Text, ForeignKey
from app.core.types import JSONType
from sqlalchemy.orm import relationship

from app.core.types import GUID
from app.models.base import BaseModel


class PersonaTemplate(BaseModel):
    __tablename__ = "persona_templates"

    brand_id = Column(
        GUID(),
        ForeignKey("brands.id"),
        nullable=False,
        index=True,
    )

    name = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    fields = Column(JSONType(), nullable=False, default=list)

    brand = relationship("Brand", back_populates="persona_templates")

    personas = relationship(
        "Persona",
        back_populates="template",
        cascade="all, delete-orphan",
    )
