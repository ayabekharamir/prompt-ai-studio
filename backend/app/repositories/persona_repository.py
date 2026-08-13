"""Persona repository - data access for Persona."""

from typing import Optional
from sqlalchemy.orm import Session

from app.models.persona import Persona
from app.repositories.base_repository import BaseRepository


class PersonaRepository(BaseRepository[Persona]):
    def __init__(self, db: Session):
        super().__init__(db, Persona)

    def list_by_brand(self, brand_id, template_id: Optional[str] = None) -> list[Persona]:
        query = self.db.query(Persona).filter(Persona.brand_id == brand_id)
        if template_id is not None:
            query = query.filter(Persona.template_id == template_id)
        return query.order_by(Persona.created_at.desc()).all()
