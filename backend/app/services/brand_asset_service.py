"""
Brand Asset service.

Orchestrates:
1. Authorization - a brand's assets may only be listed/uploaded/deleted/
   read by a user who belongs to the brand's workspace (owner or
   WorkspaceMember). A client-provided brand_id is never trusted on its
   own.
2. File validation - MIME type is sniffed from the actual file bytes
   (magic numbers), never trusted from the client-supplied Content-Type,
   and size is capped by settings.MAX_UPLOAD_SIZE_MB.
3. Storage - delegates the actual bytes to whichever StorageProvider is
   configured (see app/services/storage/); this module never assumes
   local disk vs. object storage.

Kept intentionally small/generic per this phase's scope - no image
processing, cropping, tagging, or versioning.
"""

import os
import uuid
from typing import Optional

from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.brand import Brand
from app.models.brand_asset import ASSET_CATEGORIES, BrandAsset
from app.models.user import User
from app.repositories.brand_asset_repository import BrandAssetRepository
from app.repositories.brand_repository import BrandRepository
from app.repositories.workspace_repository import WorkspaceRepository
from app.services.storage.base import StorageProviderBase


class BrandNotFoundError(Exception):
    """Raised when the target brand does not exist."""


class BrandAccessDeniedError(Exception):
    """Raised when the current user does not belong to the brand's workspace."""


class AssetNotFoundError(Exception):
    """Raised when the target asset does not exist."""


class InvalidFileError(Exception):
    """Raised when the uploaded file fails type/size validation."""


# Signature (magic-number) based detection - never trust the client's
# declared Content-Type. Kept dependency-free (no Pillow/python-magic)
# since only three, well-known signatures need to be recognized.
_SIGNATURES: dict[str, tuple[bytes, ...]] = {
    "image/png": (b"\x89PNG\r\n\x1a\n",),
    "image/jpeg": (b"\xff\xd8\xff",),
    # WEBP: "RIFF" .... "WEBP" - checked separately below.
}

_EXTENSION_BY_MIME = {
    "image/png": ".png",
    "image/jpeg": ".jpg",
    "image/webp": ".webp",
}

_MAX_ORIGINAL_FILENAME_LEN = 200


def _sniff_image_mime_type(content: bytes) -> Optional[str]:
    if content.startswith(b"\x89PNG\r\n\x1a\n"):
        return "image/png"
    if content.startswith(b"\xff\xd8\xff"):
        return "image/jpeg"
    if len(content) >= 12 and content[0:4] == b"RIFF" and content[8:12] == b"WEBP":
        return "image/webp"
    return None


def _ensure_brand_access(db: Session, brand_id: str, user: User) -> Brand:
    brand = BrandRepository(db).get(brand_id)
    if brand is None:
        raise BrandNotFoundError(f"Brand not found: {brand_id}")

    if not WorkspaceRepository(db).is_member(brand.workspace_id, user.id):
        raise BrandAccessDeniedError(
            "You do not have access to this brand's workspace."
        )

    return brand


def list_brand_assets(db: Session, brand_id: str, user: User) -> list[BrandAsset]:
    _ensure_brand_access(db, brand_id, user)
    return BrandAssetRepository(db).list_by_brand(brand_id)


def upload_brand_asset(
    db: Session,
    storage: StorageProviderBase,
    brand_id: str,
    user: User,
    content: bytes,
    original_filename: Optional[str],
    category: Optional[str],
) -> BrandAsset:
    brand = _ensure_brand_access(db, brand_id, user)

    max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    if len(content) == 0:
        raise InvalidFileError("Uploaded file is empty.")
    if len(content) > max_bytes:
        raise InvalidFileError(
            f"File exceeds the {settings.MAX_UPLOAD_SIZE_MB}MB size limit."
        )

    mime_type = _sniff_image_mime_type(content)
    if mime_type is None:
        raise InvalidFileError(
            "Unsupported file type. Only PNG, JPEG, and WEBP images are allowed."
        )

    normalized_category = (category or "other").strip().lower()
    if normalized_category not in ASSET_CATEGORIES:
        normalized_category = "other"

    safe_original_filename = None
    if original_filename:
        # Strip any path components a client might send - defense in
        # depth even though the stored filename below never reuses this
        # value for the actual disk path.
        safe_original_filename = os.path.basename(original_filename)[
            :_MAX_ORIGINAL_FILENAME_LEN
        ]

    asset_id = uuid.uuid4()
    extension = _EXTENSION_BY_MIME[mime_type]
    stored_filename = f"{asset_id}{extension}"
    storage_key = f"brand-assets/{brand.id}/{asset_id}/{stored_filename}"

    storage.save(storage_key, content)

    try:
        asset = BrandAsset(
            id=asset_id,
            brand_id=brand.id,
            uploaded_by=user.id,
            filename=stored_filename,
            original_filename=safe_original_filename,
            mime_type=mime_type,
            size_bytes=len(content),
            storage_key=storage_key,
            category=normalized_category,
        )
        db.add(asset)
        db.commit()
        db.refresh(asset)
        return asset
    except Exception:
        # Don't leave an orphaned file behind if the DB write fails.
        storage.delete(storage_key)
        raise


def delete_brand_asset(
    db: Session, storage: StorageProviderBase, asset_id: str, user: User
) -> None:
    asset = BrandAssetRepository(db).get(asset_id)
    if asset is None:
        raise AssetNotFoundError(f"Asset not found: {asset_id}")

    # Re-checks brand/workspace access using the asset's own brand_id -
    # never trusts a brand_id supplied by the client for this call.
    _ensure_brand_access(db, str(asset.brand_id), user)

    storage.delete(asset.storage_key)
    db.delete(asset)
    db.commit()


def get_brand_asset_file(
    db: Session, storage: StorageProviderBase, asset_id: str, user: User
) -> tuple[BrandAsset, bytes]:
    asset = BrandAssetRepository(db).get(asset_id)
    if asset is None:
        raise AssetNotFoundError(f"Asset not found: {asset_id}")

    _ensure_brand_access(db, str(asset.brand_id), user)

    content = storage.read(asset.storage_key)
    return asset, content
