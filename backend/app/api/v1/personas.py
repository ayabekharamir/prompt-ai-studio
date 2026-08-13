"""
Persona Templates + Personas endpoints. Mirrors app/api/v1/products.py -
see app/services/persona_service.py for authorization and
field-validation rules.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.persona import PersonaCreate, PersonaRead, PersonaUpdate
from app.schemas.persona_template import (
    PersonaTemplateCreate,
    PersonaTemplateRead,
    PersonaTemplateUpdate,
)
from app.services import persona_service as svc

router = APIRouter()


def _handle_common_errors(exc: Exception):
    if isinstance(exc, svc.BrandNotFoundError):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Brand not found")
    if isinstance(exc, svc.BrandAccessDeniedError):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    if isinstance(exc, svc.TemplateNotFoundError):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Persona template not found")
    if isinstance(exc, svc.PersonaNotFoundError):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Persona not found")
    if isinstance(exc, svc.InvalidFieldValuesError):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    raise exc


# --- Persona Templates ---------------------------------------------------

@router.post(
    "/brands/{brand_id}/persona-templates",
    response_model=PersonaTemplateRead,
    status_code=status.HTTP_201_CREATED,
)
def create_persona_template(
    brand_id: str,
    payload: PersonaTemplateCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return svc.create_persona_template(
            db=db,
            brand_id=brand_id,
            user=current_user,
            name=payload.name,
            description=payload.description,
            fields=payload.fields,
        )
    except Exception as exc:
        _handle_common_errors(exc)


@router.get("/brands/{brand_id}/persona-templates", response_model=list[PersonaTemplateRead])
def list_persona_templates(
    brand_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return svc.list_persona_templates(db=db, brand_id=brand_id, user=current_user)
    except Exception as exc:
        _handle_common_errors(exc)


@router.patch("/persona-templates/{template_id}", response_model=PersonaTemplateRead)
def update_persona_template(
    template_id: str,
    payload: PersonaTemplateUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return svc.update_persona_template(
            db=db,
            template_id=template_id,
            user=current_user,
            name=payload.name,
            description=payload.description,
            fields=payload.fields,
        )
    except Exception as exc:
        _handle_common_errors(exc)


@router.delete("/persona-templates/{template_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_persona_template(
    template_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        svc.delete_persona_template(db=db, template_id=template_id, user=current_user)
    except Exception as exc:
        _handle_common_errors(exc)
    return None


# --- Personas ------------------------------------------------------------

@router.post(
    "/brands/{brand_id}/personas",
    response_model=PersonaRead,
    status_code=status.HTTP_201_CREATED,
)
def create_persona(
    brand_id: str,
    payload: PersonaCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return svc.create_persona(
            db=db,
            brand_id=brand_id,
            user=current_user,
            template_id=str(payload.template_id),
            name=payload.name,
            field_values=payload.field_values,
        )
    except Exception as exc:
        _handle_common_errors(exc)


@router.get("/brands/{brand_id}/personas", response_model=list[PersonaRead])
def list_personas(
    brand_id: str,
    template_id: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return svc.list_personas(db=db, brand_id=brand_id, user=current_user, template_id=template_id)
    except Exception as exc:
        _handle_common_errors(exc)


@router.patch("/personas/{persona_id}", response_model=PersonaRead)
def update_persona(
    persona_id: str,
    payload: PersonaUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return svc.update_persona(
            db=db,
            persona_id=persona_id,
            user=current_user,
            name=payload.name,
            field_values=payload.field_values,
        )
    except Exception as exc:
        _handle_common_errors(exc)


@router.delete("/personas/{persona_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_persona(
    persona_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        svc.delete_persona(db=db, persona_id=persona_id, user=current_user)
    except Exception as exc:
        _handle_common_errors(exc)
    return None
