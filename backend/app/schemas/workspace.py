"""Pydantic schemas for Workspace."""

from uuid import UUID
from datetime import datetime
from pydantic import BaseModel


class WorkspaceBase(BaseModel):
    name: str


class WorkspaceCreate(WorkspaceBase):
    pass


class WorkspaceRead(WorkspaceBase):
    id: UUID
    slug: str
    owner_id: UUID
    created_at: datetime

    model_config = {"from_attributes": True}
