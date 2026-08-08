"""
Auth endpoints.
Active: register / login / refresh (email + password, JWT).
Swagger OAuth2 compatible token endpoint added.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
)

from app.schemas.auth import (
    RegisterRequest,
    LoginRequest,
    TokenResponse,
    RefreshTokenRequest,
    OTPRequest,
    OTPVerifyRequest,
)

from app.schemas.user import UserRead
from app.services import auth_service, otp_service


router = APIRouter()


# -------------------------------------------------
# Register
# -------------------------------------------------

@router.post(
    "/register",
    response_model=UserRead,
    status_code=status.HTTP_201_CREATED,
)
def register(
    payload: RegisterRequest,
    db: Session = Depends(get_db),
):
    try:
        user = auth_service.register_user(db, payload)

    except IntegrityError:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email or phone number already exists.",
        )

    return user



# -------------------------------------------------
# Normal JSON Login
# Used by frontend/mobile clients
# -------------------------------------------------

@router.post(
    "/login",
    response_model=TokenResponse,
)
def login(
    payload: LoginRequest,
    db: Session = Depends(get_db),
):

    user = auth_service.authenticate_user(
        db,
        payload,
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )


    return TokenResponse(
        access_token=create_access_token(
            subject=str(user.id)
        ),
        refresh_token=create_refresh_token(
            subject=str(user.id)
        ),
    )



# -------------------------------------------------
# OAuth2 Token Endpoint
# Used by FastAPI Swagger Authorize button
# -------------------------------------------------

@router.post(
    "/token",
    response_model=TokenResponse,
)
def oauth2_login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):

    payload = LoginRequest(
        email=form_data.username,
        password=form_data.password,
    )


    user = auth_service.authenticate_user(
        db,
        payload,
    )


    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )


    return TokenResponse(
        access_token=create_access_token(
            subject=str(user.id)
        ),
        refresh_token=create_refresh_token(
            subject=str(user.id)
        ),
    )



# -------------------------------------------------
# Refresh Token
# -------------------------------------------------

@router.post(
    "/refresh",
    response_model=TokenResponse,
)
def refresh_token(
    payload: RefreshTokenRequest,
):

    data = decode_token(
        payload.refresh_token
    )


    if not data or data.get("type") != "refresh":

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )


    subject = data["sub"]


    return TokenResponse(
        access_token=create_access_token(
            subject=subject
        ),
        refresh_token=create_refresh_token(
            subject=subject
        ),
    )



# -------------------------------------------------
# OTP endpoints
# Architecture ready
# -------------------------------------------------

@router.post(
    "/otp/request",
    status_code=status.HTTP_202_ACCEPTED,
)
def request_otp(
    payload: OTPRequest,
):

    otp_service.request_otp(
        payload.phone_number
    )

    return {
        "message": "OTP sent (mock in Phase 1)"
    }



@router.post("/otp/verify")
def verify_otp(
    payload: OTPVerifyRequest,
):

    is_valid = otp_service.verify_otp(
        payload.phone_number,
        payload.code,
    )


    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired OTP",
        )


    return {
        "message": "Phone number verified (mock in Phase 1)"
    }
