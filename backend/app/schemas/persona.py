"""Pydantic schemas for Personas."""

from typing import Any, Dict, Optional
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel


class PersonaBase(BaseModel):
    name: str
    field_values: Dict[str, Any] = {}


class PersonaCreate(PersonaBase):
    template_id: UUID


class PersonaUpdate(BaseModel):
    """Partial update - only fields provided are changed. template_id is
    intentionally not editable here - see ProductUpdate for the same
    reasoning."""

    name: Optional[str] = None
    field_values: Optional[Dict[str, Any]] = None


class PersonaRead(PersonaBase):
    id: UUID
    brand_id: UUID
    template_id: UUID
    created_at: datetime

    model_config = {"from_attributes": True}
