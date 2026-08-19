"""Add OAuth provider fields and nullable password support

Revision ID: 004_add_oauth_provider
Revises: 003_add_user_auth
Create Date: 2026-08-19 12:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = '004_add_oauth_provider'
down_revision: Union[str, None] = '003_add_user_auth'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    columns = [c['name'] for c in inspector.get_columns('users')]
    
    if 'auth_provider' not in columns:
        op.add_column('users', sa.Column('auth_provider', sa.String(length=50), nullable=False, server_default='local'))
    if 'provider_user_id' not in columns:
        op.add_column('users', sa.Column('provider_user_id', sa.String(length=255), nullable=True))
        try:
            op.create_index(op.f('ix_users_provider_user_id'), 'users', ['provider_user_id'], unique=False)
        except Exception:
            pass


def downgrade() -> None:
    try:
        op.drop_index(op.f('ix_users_provider_user_id'), table_name='users')
    except Exception:
        pass
    op.drop_column('users', 'provider_user_id')
    op.drop_column('users', 'auth_provider')
