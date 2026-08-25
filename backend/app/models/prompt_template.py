"""
Prompt Template model: reusable prompt skeletons with placeholders,
organized by category.
"""

from sqlalchemy import Column, String, Text, ForeignKey
from sqlalchemy.orm import relationship

from app.core.types import GUID
from app.models.base import BaseModel


class PromptTemplate(BaseModel):
    __tablename__ = "prompt_templates"

    workspace_id = Column(
        GUID(),
        ForeignKey("workspaces.id"),
        nullable=True,
    )

    title = Column(
        String(200),
        nullable=False,
    )

    category = Column(
        String(100),
        nullable=False,
    )  # see prompts/PROMPT_CATEGORIES.md

    description = Column(
        Text,
        nullable=True,
    )

    template_body = Column(
        Text,
        nullable=False,
    )  # contains {{placeholders}}

    is_system_template = Column(
        String(10),
        default="false",
    )  # "true" for built-in templates

    prompts = relationship(
        "Prompt",
        back_populates="template",
    )
