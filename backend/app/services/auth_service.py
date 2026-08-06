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


def register_user(db: Session, data: RegisterRequest) -> User:
    user = User(
        full_name=data.full_name,
        email=data.email,
        phone_number=data.phone_number,
        hashed_password=hash_password(data.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def authenticate_user(db: Session, data: LoginRequest) -> Optional[User]:
    query = db.query(User)
    if data.email:
        user = query.filter(User.email == data.email).first()
    elif data.phone_number:
        user = query.filter(User.phone_number == data.phone_number).first()
    else:
        return None

    if not user or not user.hashed_password:
        return None
    if not verify_password(data.password, user.hashed_password):
        return None

    return user
