"""Persona Template repository - data access for PersonaTemplate."""

from sqlalchemy.orm import Session

from app.models.persona_template import PersonaTemplate
from app.repositories.base_repository import BaseRepository


class PersonaTemplateRepository(BaseRepository[PersonaTemplate]):
    def __init__(self, db: Session):
        super().__init__(db, PersonaTemplate)

    def list_by_brand(self, brand_id) -> list[PersonaTemplate]:
        return (
            self.db.query(PersonaTemplate)
            .filter(PersonaTemplate.brand_id == brand_id)
            .order_by(PersonaTemplate.created_at.desc())
            .all()
        )
