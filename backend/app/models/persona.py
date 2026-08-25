"""
Persona model: a single brand persona (a specific customer profile,
influencer, team member, etc.), created from one of that brand's
PersonaTemplates.
"""

from sqlalchemy import Column, String, ForeignKey
from app.core.types import JSONType
from sqlalchemy.orm import relationship

from app.core.types import GUID
from app.models.base import BaseModel


class Persona(BaseModel):
    __tablename__ = "personas"

    brand_id = Column(
        GUID(),
        ForeignKey("brands.id"),
        nullable=False,
        index=True,
    )

    template_id = Column(
        GUID(),
        ForeignKey("persona_templates.id"),
        nullable=False,
        index=True,
    )

    name = Column(String(200), nullable=False)
    field_values = Column(JSONType(), nullable=False, default=dict)

    brand = relationship("Brand", back_populates="personas")

    template = relationship(
        "PersonaTemplate",
        back_populates="personas",
    )
