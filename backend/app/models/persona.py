"""
Persona model: a single brand persona (a specific customer profile,
influencer, team member, etc.), created from one of that brand's
PersonaTemplates. Mirrors Product exactly - see that module's
docstring for the `field_values` shape.
"""

from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import relationship

from app.models.base import BaseModel


class Persona(BaseModel):
    __tablename__ = "personas"

    brand_id = Column(UUID(as_uuid=True), ForeignKey("brands.id"), nullable=False, index=True)
    template_id = Column(
        UUID(as_uuid=True), ForeignKey("persona_templates.id"), nullable=False, index=True
    )

    name = Column(String(200), nullable=False)
    field_values = Column(JSONB, nullable=False, default=dict)

    brand = relationship("Brand", back_populates="personas")
    template = relationship("PersonaTemplate", back_populates="personas")
