"""
Brand Assets endpoints.

Minimal upload/list/delete/read API for a Brand's visual/media assets
(logos, product photos, reference images, ...). See
app/services/brand_asset_service.py for authorization + validation and
app/services/storage/ for the storage abstraction.
"""

from fastapi import APIRouter, Depends, File, Form, HTTPException, Response, UploadFile, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.brand_asset import BrandAssetRead
from app.services import brand_asset_service as svc
from app.services.storage.base import StorageProviderBase
from app.services.storage.factory import get_storage_provider

router = APIRouter()


def _get_storage() -> StorageProviderBase:
    return get_storage_provider()


def _asset_to_read(asset) -> BrandAssetRead:
    return BrandAssetRead(
        id=asset.id,
        brand_id=asset.brand_id,
        filename=asset.filename,
        original_filename=asset.original_filename,
        mime_type=asset.mime_type,
        size_bytes=asset.size_bytes,
        category=asset.category,
        description=asset.description,
        created_at=asset.created_at,
        url=f"/assets/{asset.id}/file",
    )


@router.post(
    "/brands/{brand_id}/assets",
    response_model=BrandAssetRead,
    status_code=status.HTTP_201_CREATED,
)
async def upload_brand_asset(
    brand_id: str,
    file: UploadFile = File(...),
    category: str = Form("other"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    storage: StorageProviderBase = Depends(_get_storage),
):
    content = await file.read()
    try:
        asset = svc.upload_brand_asset(
            db=db,
            storage=storage,
            brand_id=brand_id,
            user=current_user,
            content=content,
            original_filename=file.filename,
            category=category,
        )
    except svc.BrandNotFoundError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Brand not found")
    except svc.BrandAccessDeniedError:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    except svc.InvalidFileError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))

    return _asset_to_read(asset)


@router.get("/brands/{brand_id}/assets", response_model=list[BrandAssetRead])
def list_brand_assets(
    brand_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        assets = svc.list_brand_assets(db=db, brand_id=brand_id, user=current_user)
    except svc.BrandNotFoundError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Brand not found")
    except svc.BrandAccessDeniedError:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    return [_asset_to_read(a) for a in assets]


@router.delete("/assets/{asset_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_brand_asset(
    asset_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    storage: StorageProviderBase = Depends(_get_storage),
):
    try:
        svc.delete_brand_asset(db=db, storage=storage, asset_id=asset_id, user=current_user)
    except svc.AssetNotFoundError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Asset not found")
    except svc.BrandAccessDeniedError:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    return None


@router.get("/assets/{asset_id}/file")
def get_brand_asset_file(
    asset_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    storage: StorageProviderBase = Depends(_get_storage),
):
    try:
        asset, content = svc.get_brand_asset_file(
            db=db, storage=storage, asset_id=asset_id, user=current_user
        )
    except svc.AssetNotFoundError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Asset not found")
    except svc.BrandAccessDeniedError:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    except FileNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Asset file is missing from storage"
        )

    return Response(content=content, media_type=asset.mime_type)
