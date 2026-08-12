"""Pydantic schemas for Brand Assets."""

from typing import Optional
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel


class BrandAssetRead(BaseModel):
    id: UUID
    brand_id: UUID
    filename: str
    original_filename: Optional[str] = None
    mime_type: str
    size_bytes: int
    category: str
    description: Optional[str] = None
    created_at: datetime

    # Relative API path the frontend fetches (with auth) to get the file
    # bytes, e.g. "/assets/{id}/file". Deliberately not a direct storage
    # URL - the backend enforces authorization on every read regardless of
    # which StorageProvider is behind it.
    url: str

    model_config = {"from_attributes": True}
