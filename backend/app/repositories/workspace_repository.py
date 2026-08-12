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

    def is_member(self, workspace_id, user_id) -> bool:
        """
        True if user_id is the workspace owner or a WorkspaceMember of
        workspace_id. Used to authorize access to brand-scoped resources
        (e.g. Brand Assets) so a client-provided brand_id can never be
        used to reach another workspace's data.
        """
        workspace = self.get(workspace_id)
        if workspace is None:
            return False
        if str(workspace.owner_id) == str(user_id):
            return True
        return (
            self.db.query(WorkspaceMember)
            .filter(
                WorkspaceMember.workspace_id == workspace_id,
                WorkspaceMember.user_id == user_id,
            )
            .first()
            is not None
        )
