"""Workspace endpoints."""

import re
import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.workspace import WorkspaceCreate, WorkspaceRead
from app.repositories.workspace_repository import WorkspaceRepository

router = APIRouter()


def _slugify(name: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
    return f"{slug}-{uuid.uuid4().hex[:6]}"


@router.post("/", response_model=WorkspaceRead, status_code=status.HTTP_201_CREATED)
def create_workspace(
    payload: WorkspaceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    repo = WorkspaceRepository(db)
    workspace = repo.model(name=payload.name, slug=_slugify(payload.name), owner_id=current_user.id)
    db.add(workspace)
    db.flush()

    repo.add_member(workspace_id=workspace.id, user_id=current_user.id, role="owner")

    db.commit()
    db.refresh(workspace)
    return workspace


@router.get("/", response_model=list[WorkspaceRead])
def list_workspaces(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return WorkspaceRepository(db).list_for_user(current_user.id)


@router.get("/{workspace_id}", response_model=WorkspaceRead)
def get_workspace(
    workspace_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    workspace = WorkspaceRepository(db).get(workspace_id)
    if not workspace:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workspace not found")
    return workspace
