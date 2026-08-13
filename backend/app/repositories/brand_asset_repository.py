"""Brand Asset repository - data access for BrandAsset."""

from sqlalchemy.orm import Session

from app.models.brand_asset import BrandAsset
from app.repositories.base_repository import BaseRepository


class BrandAssetRepository(BaseRepository[BrandAsset]):
    def __init__(self, db: Session):
        super().__init__(db, BrandAsset)

    def list_by_brand(self, brand_id) -> list[BrandAsset]:
        return (
            self.db.query(BrandAsset)
            .filter(BrandAsset.brand_id == brand_id)
            .order_by(BrandAsset.created_at.desc())
            .all()
        )
