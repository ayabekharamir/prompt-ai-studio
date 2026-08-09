"""Prompt execution repository - data access for PromptExecution history."""

from sqlalchemy.orm import Session

from app.models.prompt_execution import PromptExecution
from app.repositories.base_repository import BaseRepository


class PromptExecutionRepository(BaseRepository[PromptExecution]):
    def __init__(self, db: Session):
        super().__init__(db, PromptExecution)

    def list_by_prompt(self, prompt_id) -> list[PromptExecution]:
        return (
            self.db.query(PromptExecution)
            .filter(PromptExecution.prompt_id == prompt_id)
            .order_by(PromptExecution.created_at.desc())
            .all()
        )
