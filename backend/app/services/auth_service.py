"""
Authentication service.
Handles user registration and login logic for the hybrid auth strategy:
- Email + Password (active)
- Phone + OTP (architecture ready, not activated - see services/sms/)
- OAuth providers (reserved for future integration)
"""

from typing import Optional
from sqlalchemy.orm import Session

from app.models.user import User
from app.schemas.auth import RegisterRequest, LoginRequest
from app.core.security import hash_password, verify_password
from app.repositories.user_repository import UserRepository


def register_user(db: Session, data: RegisterRequest) -> User:
    repo = UserRepository(db)
    return repo.create(
        full_name=data.full_name,
        email=data.email,
        phone_number=data.phone_number,
        hashed_password=hash_password(data.password),
    )


def authenticate_user(db: Session, data: LoginRequest) -> Optional[User]:
    repo = UserRepository(db)

    if data.email:
        user = repo.get_by_email(data.email)
    elif data.phone_number:
        user = repo.get_by_phone_number(data.phone_number)
    else:
        return None

    if not user or not user.hashed_password:
        return None
    if not verify_password(data.password, user.hashed_password):
        return None

    return user
