"""Add user auth fields

Revision ID: 003_add_user_auth
Revises: 002_add_documents
Create Date: 2026-08-17 15:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = '003_add_user_auth'
down_revision: Union[str, None] = '002_add_documents'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    columns = [c['name'] for c in inspector.get_columns('users')]
    
    if 'is_active' not in columns:
        op.add_column('users', sa.Column('is_active', sa.Boolean(), nullable=False, server_default=sa.text('1')))
    if 'reset_token' not in columns:
        op.add_column('users', sa.Column('reset_token', sa.String(length=255), nullable=True))
    if 'reset_token_expires' not in columns:
        op.add_column('users', sa.Column('reset_token_expires', sa.DateTime(), nullable=True))
    if 'updated_at' not in columns:
        op.add_column('users', sa.Column('updated_at', sa.DateTime(), nullable=True))


def downgrade() -> None:
    op.drop_column('users', 'updated_at')
    op.drop_column('users', 'reset_token_expires')
    op.drop_column('users', 'reset_token')
    op.drop_column('users', 'is_active')
