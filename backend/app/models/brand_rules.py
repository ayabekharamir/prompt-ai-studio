"""
Brand Rules model: constraints / guardrails the Brand Brain enforces
when generating prompts (e.g. words to avoid, mandatory disclaimers).
"""

from sqlalchemy import Column, String, Text, ForeignKey
from sqlalchemy.orm import relationship

from app.core.types import GUID
from app.models.base import BaseModel


class BrandRule(BaseModel):
    __tablename__ = "brand_rules"

    brand_id = Column(
        GUID(),
        ForeignKey("brands.id"),
        nullable=False,
    )

    # tone | wording | compliance | visual | other
    rule_type = Column(
        String(50),
        nullable=False,
        default="other",
    )

    title = Column(
        String(200),
        nullable=False,
    )

    description = Column(
        Text,
        nullable=True,
    )

    brand = relationship(
        "Brand",
        back_populates="rules",
    )
