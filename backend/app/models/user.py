"""
User model.
Supports hybrid authentication: email/password + phone (SMS OTP, future) + OAuth (future).
"""

from sqlalchemy import Column, String, Boolean
from sqlalchemy.orm import relationship

from app.models.base import BaseModel


class User(BaseModel):
    __tablename__ = "users"

    full_name = Column(String(150), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=True)
    phone_number = Column(String(20), unique=True, index=True, nullable=True)

    hashed_password = Column(String(255), nullable=True)  # null if OAuth-only user

    is_email_verified = Column(Boolean, default=False)
    is_phone_verified = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)

    # OAuth provider info (future use)
    oauth_provider = Column(String(50), nullable=True)  # google | apple | microsoft
    oauth_provider_id = Column(String(255), nullable=True)

    workspace_memberships = relationship("WorkspaceMember", back_populates="user")
