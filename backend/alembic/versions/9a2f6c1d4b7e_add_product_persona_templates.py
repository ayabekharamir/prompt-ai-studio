"""add product/persona templates and instances tables

Revision ID: 9a2f6c1d4b7e
Revises: 682344104d83
Create Date: 2026-08-13 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = '9a2f6c1d4b7e'
down_revision: Union[str, None] = '682344104d83'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table('product_templates',
    sa.Column('brand_id', sa.UUID(), nullable=False),
    sa.Column('name', sa.String(length=150), nullable=False),
    sa.Column('description', sa.Text(), nullable=True),
    sa.Column('fields', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
    sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
    sa.ForeignKeyConstraint(['brand_id'], ['brands.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_product_templates_id'), 'product_templates', ['id'], unique=False)
    op.create_index(op.f('ix_product_templates_brand_id'), 'product_templates', ['brand_id'], unique=False)

    op.create_table('products',
    sa.Column('brand_id', sa.UUID(), nullable=False),
    sa.Column('template_id', sa.UUID(), nullable=False),
    sa.Column('name', sa.String(length=200), nullable=False),
    sa.Column('field_values', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
    sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
    sa.ForeignKeyConstraint(['brand_id'], ['brands.id'], ),
    sa.ForeignKeyConstraint(['template_id'], ['product_templates.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_products_id'), 'products', ['id'], unique=False)
    op.create_index(op.f('ix_products_brand_id'), 'products', ['brand_id'], unique=False)
    op.create_index(op.f('ix_products_template_id'), 'products', ['template_id'], unique=False)

    op.create_table('persona_templates',
    sa.Column('brand_id', sa.UUID(), nullable=False),
    sa.Column('name', sa.String(length=150), nullable=False),
    sa.Column('description', sa.Text(), nullable=True),
    sa.Column('fields', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
    sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
    sa.ForeignKeyConstraint(['brand_id'], ['brands.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_persona_templates_id'), 'persona_templates', ['id'], unique=False)
    op.create_index(op.f('ix_persona_templates_brand_id'), 'persona_templates', ['brand_id'], unique=False)

    op.create_table('personas',
    sa.Column('brand_id', sa.UUID(), nullable=False),
    sa.Column('template_id', sa.UUID(), nullable=False),
    sa.Column('name', sa.String(length=200), nullable=False),
    sa.Column('field_values', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
    sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
    sa.ForeignKeyConstraint(['brand_id'], ['brands.id'], ),
    sa.ForeignKeyConstraint(['template_id'], ['persona_templates.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_personas_id'), 'personas', ['id'], unique=False)
    op.create_index(op.f('ix_personas_brand_id'), 'personas', ['brand_id'], unique=False)
    op.create_index(op.f('ix_personas_template_id'), 'personas', ['template_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_personas_template_id'), table_name='personas')
    op.drop_index(op.f('ix_personas_brand_id'), table_name='personas')
    op.drop_index(op.f('ix_personas_id'), table_name='personas')
    op.drop_table('personas')

    op.drop_index(op.f('ix_persona_templates_brand_id'), table_name='persona_templates')
    op.drop_index(op.f('ix_persona_templates_id'), table_name='persona_templates')
    op.drop_table('persona_templates')

    op.drop_index(op.f('ix_products_template_id'), table_name='products')
    op.drop_index(op.f('ix_products_brand_id'), table_name='products')
    op.drop_index(op.f('ix_products_id'), table_name='products')
    op.drop_table('products')

    op.drop_index(op.f('ix_product_templates_brand_id'), table_name='product_templates')
    op.drop_index(op.f('ix_product_templates_id'), table_name='product_templates')
    op.drop_table('product_templates')
