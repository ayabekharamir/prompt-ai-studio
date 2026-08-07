"""Prompt repository - data access for Prompt and PromptTemplate."""

from typing import Optional

from sqlalchemy.orm import Session

from app.models.prompt import Prompt
from app.models.prompt_template import PromptTemplate
from app.repositories.base_repository import BaseRepository


class PromptRepository(BaseRepository[Prompt]):
    def __init__(self, db: Session):
        super().__init__(db, Prompt)

    def list_by_workspace(self, workspace_id) -> list[Prompt]:
        return self.db.query(Prompt).filter(Prompt.workspace_id == workspace_id).all()


class PromptTemplateRepository(BaseRepository[PromptTemplate]):
    def __init__(self, db: Session):
        super().__init__(db, PromptTemplate)

    def list(self, category: Optional[str] = None) -> list[PromptTemplate]:
        query = self.db.query(PromptTemplate)
        if category:
            query = query.filter(PromptTemplate.category == category)
        return query.all()
