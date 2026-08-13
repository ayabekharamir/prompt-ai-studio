"""
Pydantic schemas for Persona Templates.
"""

from datetime import datetime
from typing import List, Literal, Optional
from uuid import UUID

from pydantic import BaseModel, Field


FieldType = Literal["text", "textarea", "number", "image", "select"]


class FieldDefinition(BaseModel):
    """
    Definition of one field in a PersonaTemplate.

    The same generic field structure can be used by both
    ProductTemplate and PersonaTemplate, while the template
    schemas themselves remain separate.
    """

    key: str = Field(
        ...,
        description=(
            "Stable machine key used to identify the field "
            "inside field_values."
        ),
    )
    label: str = Field(
        ...,
        description="Human-readable field label shown in the UI.",
    )
    type: FieldType = "text"
    required: bool = False
    options: Optional[List[str]] = None


class PersonaTemplateBase(BaseModel):
    """
    Shared fields for creating and reading a PersonaTemplate.
    """

    name: str
    description: Optional[str] = None
    fields: List[FieldDefinition] = Field(default_factory=list)


class PersonaTemplateCreate(PersonaTemplateBase):
    """
    Payload for creating a PersonaTemplate.
    """

    pass


class PersonaTemplateUpdate(BaseModel):
    """
    Partial update payload for a PersonaTemplate.
    """

    name: Optional[str] = None
    description: Optional[str] = None
    fields: Optional[List[FieldDefinition]] = None


class PersonaTemplateRead(PersonaTemplateBase):
    """
    PersonaTemplate response schema.
    """

    id: UUID
    brand_id: UUID
    created_at: datetime

    model_config = {"from_attributes": True}
