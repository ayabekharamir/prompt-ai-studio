"""Pydantic schemas for Brand, Brand Identity (Brand Brain) and Brand Rules."""

from typing import Optional
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel


class BrandBase(BaseModel):
    name: str
    industry: Optional[str] = None
    website: Optional[str] = None
    description: Optional[str] = None


class BrandCreate(BrandBase):
    pass


class BrandUpdate(BaseModel):
    """Partial update - only fields provided are changed."""

    name: Optional[str] = None
    industry: Optional[str] = None
    website: Optional[str] = None
    description: Optional[str] = None


class BrandRead(BrandBase):
    id: UUID
    workspace_id: UUID
    logo_url: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class BrandIdentityBase(BaseModel):
    mission: Optional[str] = None
    vision: Optional[str] = None
    target_audience: Optional[str] = None
    tone_of_voice: Optional[str] = None
    core_values: Optional[str] = None
    unique_selling_point: Optional[str] = None
    brand_personality: Optional[str] = None


class BrandIdentityCreate(BrandIdentityBase):
    pass


class BrandIdentityRead(BrandIdentityBase):
    id: UUID
    brand_id: UUID

    model_config = {"from_attributes": True}


class BrandRuleBase(BaseModel):
    rule_type: str = "other"
    title: str
    description: Optional[str] = None


class BrandRuleCreate(BrandRuleBase):
    pass


class BrandRuleUpdate(BaseModel):
    """Partial update - only fields provided are changed."""

    rule_type: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None


class BrandRuleRead(BrandRuleBase):
    id: UUID
    brand_id: UUID

    model_config = {"from_attributes": True}
