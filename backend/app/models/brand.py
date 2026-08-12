"""
Brand model: a brand profile that belongs to a workspace.
"""

from sqlalchemy import Column, String, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.models.base import BaseModel


class Brand(BaseModel):
    __tablename__ = "brands"

    workspace_id = Column(UUID(as_uuid=True), ForeignKey("workspaces.id"), nullable=False)

    name = Column(String(150), nullable=False)
    industry = Column(String(150), nullable=True)
    website = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    logo_url = Column(String(500), nullable=True)

    workspace = relationship("Workspace", back_populates="brands")
    identity = relationship("BrandIdentity", back_populates="brand", uselist=False)
    rules = relationship("BrandRule", back_populates="brand")
    assets = relationship("BrandAsset", back_populates="brand", cascade="all, delete-orphan")
