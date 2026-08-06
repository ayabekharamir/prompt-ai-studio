"""Pydantic schemas for User."""

from typing import Optional
from uuid import UUID
from datetime import datetime

from pydantic import BaseModel, EmailStr


class UserBase(BaseModel):
    full_name: str
    email: Optional[EmailStr] = None
    phone_number: Optional[str] = None


class UserCreate(UserBase):
    password: str


class UserRead(UserBase):
    id: UUID
    is_email_verified: bool
    is_phone_verified: bool
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}
