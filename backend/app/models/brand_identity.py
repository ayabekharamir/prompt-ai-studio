"""
Brand Identity model: the core "Brand Brain" descriptive data
(tone of voice, mission, audience, values, etc.).
"""

from sqlalchemy import Column, Text, ForeignKey
from sqlalchemy.orm import relationship

from app.core.types import GUID
from app.models.base import BaseModel


class BrandIdentity(BaseModel):
    __tablename__ = "brand_identity"

    brand_id = Column(
        GUID(),
        ForeignKey("brands.id"),
        unique=True,
        nullable=False,
    )

    mission = Column(Text, nullable=True)
    vision = Column(Text, nullable=True)
    target_audience = Column(Text, nullable=True)
    tone_of_voice = Column(Text, nullable=True)
    core_values = Column(Text, nullable=True)
    unique_selling_point = Column(Text, nullable=True)
    brand_personality = Column(Text, nullable=True)

    brand = relationship(
        "Brand",
        back_populates="identity",
    )
