"""
Persona Template model: a brand-defined, reusable field schema for one
category of brand persona (e.g. "Ideal Customer" vs "Influencer" vs
"Team Member"). Mirrors ProductTemplate exactly - see that module's
docstring for the `fields` JSON shape and field "type" values.
"""

from sqlalchemy import Column, String, Text, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import relationship

from app.models.base import BaseModel


class PersonaTemplate(BaseModel):
    __tablename__ = "persona_templates"

    brand_id = Column(UUID(as_uuid=True), ForeignKey("brands.id"), nullable=False, index=True)

    name = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    fields = Column(JSONB, nullable=False, default=list)

    brand = relationship("Brand", back_populates="persona_templates")
    personas = relationship(
        "Persona", back_populates="template", cascade="all, delete-orphan"
    )
