"""Product repository - data access for Product."""

from typing import Optional
from sqlalchemy.orm import Session

from app.models.product import Product
from app.repositories.base_repository import BaseRepository


class ProductRepository(BaseRepository[Product]):
    def __init__(self, db: Session):
        super().__init__(db, Product)

    def list_by_brand(self, brand_id, template_id: Optional[str] = None) -> list[Product]:
        query = self.db.query(Product).filter(Product.brand_id == brand_id)
        if template_id is not None:
            query = query.filter(Product.template_id == template_id)
        return query.order_by(Product.created_at.desc()).all()
