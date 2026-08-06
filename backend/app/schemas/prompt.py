"""Pydantic schemas for Prompt Templates and Prompts."""

from typing import Optional
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel


class PromptTemplateBase(BaseModel):
    title: str
    category: str
    description: Optional[str] = None
    template_body: str


class PromptTemplateCreate(PromptTemplateBase):
    pass


class PromptTemplateRead(PromptTemplateBase):
    id: UUID
    workspace_id: Optional[UUID] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class PromptBase(BaseModel):
    title: str
    content: str
    brand_id: Optional[UUID] = None
    template_id: Optional[UUID] = None
    status: str = "draft"


class PromptCreate(PromptBase):
    pass


class PromptRead(PromptBase):
    id: UUID
    workspace_id: UUID
    created_by: UUID
    created_at: datetime

    model_config = {"from_attributes": True}
