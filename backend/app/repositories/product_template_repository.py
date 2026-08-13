"""Product Template repository - data access for ProductTemplate."""

from sqlalchemy.orm import Session

from app.models.product_template import ProductTemplate
from app.repositories.base_repository import BaseRepository


class ProductTemplateRepository(BaseRepository[ProductTemplate]):
    def __init__(self, db: Session):
        super().__init__(db, ProductTemplate)

    def list_by_brand(self, brand_id) -> list[ProductTemplate]:
        return (
            self.db.query(ProductTemplate)
            .filter(ProductTemplate.brand_id == brand_id)
            .order_by(ProductTemplate.created_at.desc())
            .all()
        )
