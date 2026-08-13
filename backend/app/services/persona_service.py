"""
Persona Template + Persona service. Mirrors product_service.py exactly -
see that module's docstring for the authorization and field-validation
rules, which are identical here.
"""

from typing import Any, Dict, List, Optional

from sqlalchemy.orm import Session

from app.models.brand import Brand
from app.models.persona import Persona
from app.models.persona_template import PersonaTemplate
from app.models.user import User
from app.repositories.brand_repository import BrandRepository
from app.repositories.persona_repository import PersonaRepository
from app.repositories.persona_template_repository import PersonaTemplateRepository
from app.repositories.workspace_repository import WorkspaceRepository


class BrandNotFoundError(Exception):
    """Raised when the target brand does not exist."""


class BrandAccessDeniedError(Exception):
    """Raised when the current user does not belong to the brand's workspace."""


class TemplateNotFoundError(Exception):
    """Raised when the target persona template does not exist."""


class PersonaNotFoundError(Exception):
    """Raised when the target persona does not exist."""


class InvalidFieldValuesError(Exception):
    """Raised when field_values don't match the persona's template schema."""


def _ensure_brand_access(db: Session, brand_id: str, user: User) -> Brand:
    brand = BrandRepository(db).get(brand_id)
    if brand is None:
        raise BrandNotFoundError(f"Brand not found: {brand_id}")

    if not WorkspaceRepository(db).is_member(brand.workspace_id, user.id):
        raise BrandAccessDeniedError("You do not have access to this brand's workspace.")

    return brand


def _validate_field_values(template: PersonaTemplate, field_values: Dict[str, Any]) -> None:
    known_keys = {f["key"] for f in template.fields}
    unknown = set(field_values.keys()) - known_keys
    if unknown:
        raise InvalidFieldValuesError(f"Unknown field(s) for this template: {', '.join(sorted(unknown))}")

    missing_required = [
        f["key"]
        for f in template.fields
        if f.get("required") and not str(field_values.get(f["key"], "")).strip()
    ]
    if missing_required:
        raise InvalidFieldValuesError(
            f"Missing required field(s): {', '.join(missing_required)}"
        )


# --- Persona Templates ------------------------------------------------

def list_persona_templates(db: Session, brand_id: str, user: User) -> List[PersonaTemplate]:
    _ensure_brand_access(db, brand_id, user)
    return PersonaTemplateRepository(db).list_by_brand(brand_id)


def create_persona_template(
    db: Session, brand_id: str, user: User, name: str, description: Optional[str], fields: list
) -> PersonaTemplate:
    _ensure_brand_access(db, brand_id, user)
    template = PersonaTemplate(
        brand_id=brand_id,
        name=name,
        description=description,
        fields=[f.model_dump() if hasattr(f, "model_dump") else f for f in fields],
    )
    db.add(template)
    db.commit()
    db.refresh(template)
    return template


def _get_owned_template(db: Session, template_id: str, user: User) -> PersonaTemplate:
    template = PersonaTemplateRepository(db).get(template_id)
    if template is None:
        raise TemplateNotFoundError(f"Persona template not found: {template_id}")
    _ensure_brand_access(db, str(template.brand_id), user)
    return template


def update_persona_template(
    db: Session,
    template_id: str,
    user: User,
    name: Optional[str],
    description: Optional[str],
    fields: Optional[list],
) -> PersonaTemplate:
    template = _get_owned_template(db, template_id, user)
    if name is not None:
        template.name = name
    if description is not None:
        template.description = description
    if fields is not None:
        template.fields = [f.model_dump() if hasattr(f, "model_dump") else f for f in fields]
    db.commit()
    db.refresh(template)
    return template


def delete_persona_template(db: Session, template_id: str, user: User) -> None:
    template = _get_owned_template(db, template_id, user)
    db.delete(template)  # cascades to Persona rows via the relationship
    db.commit()


# --- Personas ---------------------------------------------------------

def list_personas(
    db: Session, brand_id: str, user: User, template_id: Optional[str] = None
) -> List[Persona]:
    _ensure_brand_access(db, brand_id, user)
    return PersonaRepository(db).list_by_brand(brand_id, template_id=template_id)


def create_persona(
    db: Session,
    brand_id: str,
    user: User,
    template_id: str,
    name: str,
    field_values: Dict[str, Any],
) -> Persona:
    _ensure_brand_access(db, brand_id, user)

    template = PersonaTemplateRepository(db).get(template_id)
    if template is None or str(template.brand_id) != str(brand_id):
        raise TemplateNotFoundError(f"Persona template not found for this brand: {template_id}")

    _validate_field_values(template, field_values)

    persona = Persona(
        brand_id=brand_id,
        template_id=template_id,
        name=name,
        field_values=field_values,
    )
    db.add(persona)
    db.commit()
    db.refresh(persona)
    return persona


def _get_owned_persona(db: Session, persona_id: str, user: User) -> Persona:
    persona = PersonaRepository(db).get(persona_id)
    if persona is None:
        raise PersonaNotFoundError(f"Persona not found: {persona_id}")
    _ensure_brand_access(db, str(persona.brand_id), user)
    return persona


def update_persona(
    db: Session,
    persona_id: str,
    user: User,
    name: Optional[str],
    field_values: Optional[Dict[str, Any]],
) -> Persona:
    persona = _get_owned_persona(db, persona_id, user)

    if field_values is not None:
        template = PersonaTemplateRepository(db).get(persona.template_id)
        _validate_field_values(template, field_values)
        persona.field_values = field_values

    if name is not None:
        persona.name = name

    db.commit()
    db.refresh(persona)
    return persona


def delete_persona(db: Session, persona_id: str, user: User) -> None:
    persona = _get_owned_persona(db, persona_id, user)
    db.delete(persona)
    db.commit()
