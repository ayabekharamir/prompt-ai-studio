"""Workspace repository - data access for Workspace and WorkspaceMember."""

from sqlalchemy.orm import Session

from app.models.workspace import Workspace, WorkspaceMember
from app.repositories.base_repository import BaseRepository


class WorkspaceRepository(BaseRepository[Workspace]):
    def __init__(self, db: Session):
        super().__init__(db, Workspace)

    def list_for_user(self, user_id) -> list[Workspace]:
        return (
            self.db.query(Workspace)
            .join(WorkspaceMember, WorkspaceMember.workspace_id == Workspace.id)
            .filter(WorkspaceMember.user_id == user_id)
            .all()
        )

    def add_member(self, workspace_id, user_id, role: str = "editor") -> WorkspaceMember:
        member = WorkspaceMember(workspace_id=workspace_id, user_id=user_id, role=role)
        self.db.add(member)
        return member
