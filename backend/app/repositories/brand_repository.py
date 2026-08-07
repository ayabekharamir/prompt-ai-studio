"""Brand repository - data access for Brand, BrandIdentity and BrandRule."""

from typing import Optional

from sqlalchemy.orm import Session

from app.models.brand import Brand
from app.models.brand_identity import BrandIdentity
from app.models.brand_rules import BrandRule
from app.repositories.base_repository import BaseRepository


class BrandRepository(BaseRepository[Brand]):
    def __init__(self, db: Session):
        super().__init__(db, Brand)

    def list_by_workspace(self, workspace_id) -> list[Brand]:
        return self.db.query(Brand).filter(Brand.workspace_id == workspace_id).all()


class BrandIdentityRepository(BaseRepository[BrandIdentity]):
    def __init__(self, db: Session):
        super().__init__(db, BrandIdentity)

    def get_by_brand(self, brand_id) -> Optional[BrandIdentity]:
        return self.db.query(BrandIdentity).filter(BrandIdentity.brand_id == brand_id).first()


class BrandRuleRepository(BaseRepository[BrandRule]):
    def __init__(self, db: Session):
        super().__init__(db, BrandRule)

    def list_by_brand(self, brand_id) -> list[BrandRule]:
        return self.db.query(BrandRule).filter(BrandRule.brand_id == brand_id).all()
