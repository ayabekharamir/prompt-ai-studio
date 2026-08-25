"""
Prompt model: a generated/saved prompt, optionally built from a template
and linked to a brand for Brand Brain context.
"""

from sqlalchemy import Column, String, Text, ForeignKey
from sqlalchemy.orm import relationship

from app.core.types import GUID
from app.models.base import BaseModel


class Prompt(BaseModel):
    __tablename__ = "prompts"

    workspace_id = Column(
        GUID(),
        ForeignKey("workspaces.id"),
        nullable=False,
    )

    brand_id = Column(
        GUID(),
        ForeignKey("brands.id"),
        nullable=True,
    )

    template_id = Column(
        GUID(),
        ForeignKey("prompt_templates.id"),
        nullable=True,
    )

    created_by = Column(
        GUID(),
        ForeignKey("users.id"),
        nullable=False,
    )

    title = Column(
        String(200),
        nullable=False,
    )

    content = Column(
        Text,
        nullable=False,
    )

    # draft | saved | archived
    # generation status reserved for future AI integration
    status = Column(
        String(30),
        nullable=False,
        default="draft",
    )

    template = relationship(
        "PromptTemplate",
        back_populates="prompts",
    )
