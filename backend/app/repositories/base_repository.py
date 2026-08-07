"""
Generic base repository.

Repository Pattern preparation (Phase 1): centralizes raw SQLAlchemy Session
access behind a small, typed interface so services/endpoints stop calling
`db.query(...)` directly. Concrete repositories (UserRepository,
WorkspaceRepository, ...) subclass this for model-specific query methods
(filter by email, list-by-workspace, etc.) while reusing get/create/
delete here.

This is introduced additively: existing service functions and endpoints
keep their current signatures and behavior. Call sites are migrated to use
a repository incrementally, one module at a time, rather than in one
breaking rewrite - see auth_service.py for the first migrated example.
"""

from typing import Generic, Optional, Type, TypeVar

from sqlalchemy.orm import Session

from app.core.database import Base

ModelType = TypeVar("ModelType", bound=Base)


class BaseRepository(Generic[ModelType]):
    def __init__(self, db: Session, model: Type[ModelType]):
        self.db = db
        self.model = model

    def get(self, id) -> Optional[ModelType]:
        return self.db.query(self.model).filter(self.model.id == id).first()

    def list(self, **filters) -> list[ModelType]:
        query = self.db.query(self.model)
        for field, value in filters.items():
            query = query.filter(getattr(self.model, field) == value)
        return query.all()

    def create(self, **fields) -> ModelType:
        instance = self.model(**fields)
        self.db.add(instance)
        self.db.commit()
        self.db.refresh(instance)
        return instance

    def delete(self, instance: ModelType) -> None:
        self.db.delete(instance)
        self.db.commit()
