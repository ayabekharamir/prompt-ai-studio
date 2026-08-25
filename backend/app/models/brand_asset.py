"""
BrandAsset model: metadata for a media/visual file uploaded to a Brand
(logo, product photo, reference image, ...).

The database only stores metadata + a storage_key reference; the actual
file bytes live in whatever StorageProvider is configured (see
app/services/storage/). This keeps the schema identical regardless of
whether files end up on local disk or, later, S3-compatible storage.

Note: this is a distinct concept from the (not yet implemented) planned
`brand_visuals` table described in Documentation/DATABASE_SCHEMA.md, which
is meant to store visual *brand guideline* metadata (primary/secondary
colors, fonts, visual style, design rules) - not uploaded files.
"""

from sqlalchemy import Column, String, Text, Integer, ForeignKey
from sqlalchemy.orm import relationship

from app.core.types import GUID
from app.models.base import BaseModel


# Generic, non-brand-specific categories (kept intentionally simple).
ASSET_CATEGORIES = (
    "logo",
    "logo_variant",
    "brand_photo",
    "product",
    "character",
    "reference",
    "other",
)


class BrandAsset(BaseModel):
    __tablename__ = "brand_assets"

    brand_id = Column(
        GUID(),
        ForeignKey("brands.id"),
        nullable=False,
        index=True,
    )

    uploaded_by = Column(
        GUID(),
        ForeignKey("users.id"),
        nullable=True,
    )

    filename = Column(
        String(255),
        nullable=False,
    )

    original_filename = Column(
        String(255),
        nullable=True,
    )

    mime_type = Column(
        String(100),
        nullable=False,
    )

    size_bytes = Column(
        Integer,
        nullable=False,
    )

    # Relative, tenant-scoped storage path, e.g.
    # "brand-assets/{brand_id}/{asset_id}/{filename}". Never a full URL -
    # resolving it to bytes/URL is the StorageProvider's job.
    storage_key = Column(
        String(500),
        nullable=False,
    )

    category = Column(
        String(30),
        nullable=False,
        default="other",
    )

    description = Column(
        Text,
        nullable=True,
    )

    brand = relationship(
        "Brand",
        back_populates="assets",
    )
