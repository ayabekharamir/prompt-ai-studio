"""
Workspace models: a Workspace groups brands and users (SaaS multi-tenancy unit).
"""

from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.orm import relationship

from app.core.types import GUID
from app.models.base import BaseModel


class Workspace(BaseModel):
    __tablename__ = "workspaces"

    name = Column(String(150), nullable=False)
    slug = Column(String(150), unique=True, index=True, nullable=False)

    owner_id = Column(
        GUID(),
        ForeignKey("users.id"),
        nullable=False,
    )

    members = relationship("WorkspaceMember", back_populates="workspace")
    brands = relationship("Brand", back_populates="workspace")


class WorkspaceMember(BaseModel):
    __tablename__ = "workspace_members"

    workspace_id = Column(
        GUID(),
        ForeignKey("workspaces.id"),
        nullable=False,
    )

    user_id = Column(
        GUID(),
        ForeignKey("users.id"),
        nullable=False,
    )

    # owner | admin | editor | viewer
    role = Column(String(30), nullable=False, default="editor")

    workspace = relationship("Workspace", back_populates="members")
    user = relationship("User", back_populates="workspace_memberships")
