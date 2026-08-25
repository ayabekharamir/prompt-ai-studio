"""add brand_assets table

Revision ID: 682344104d83
Revises: 3b1bbefb4e73
Create Date: 2026-08-12 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from app.core.types import GUID


# revision identifiers, used by Alembic.
revision: str = '682344104d83'
down_revision: Union[str, None] = '3b1bbefb4e73'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table('brand_assets',
    sa.Column('brand_id', GUID(), nullable=False),
    sa.Column('uploaded_by', GUID(), nullable=True),
    sa.Column('filename', sa.String(length=255), nullable=False),
    sa.Column('original_filename', sa.String(length=255), nullable=True),
    sa.Column('mime_type', sa.String(length=100), nullable=False),
    sa.Column('size_bytes', sa.Integer(), nullable=False),
    sa.Column('storage_key', sa.String(length=500), nullable=False),
    sa.Column('category', sa.String(length=30), nullable=False),
    sa.Column('description', sa.Text(), nullable=True),
    sa.Column('id', GUID(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
    sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
    sa.ForeignKeyConstraint(['brand_id'], ['brands.id'], ),
    sa.ForeignKeyConstraint(['uploaded_by'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_brand_assets_id'), 'brand_assets', ['id'], unique=False)
    op.create_index(op.f('ix_brand_assets_brand_id'), 'brand_assets', ['brand_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_brand_assets_brand_id'), table_name='brand_assets')
    op.drop_index(op.f('ix_brand_assets_id'), table_name='brand_assets')
    op.drop_table('brand_assets')
