"""add_refresh_token_blacklist

Revision ID: 2e4b2409e4f3
Revises: 38d5d77c2a62
Create Date: 2026-04-11 11:07:02.423623

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '2e4b2409e4f3'
down_revision: Union[str, Sequence[str], None] = '38d5d77c2a62'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'refresh_token_blacklist',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('jti', sa.String(36), nullable=False, unique=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('user.id'), nullable=False),
        sa.Column('expires_at', sa.DateTime(), nullable=False),
        sa.Column('revoked_at', sa.DateTime(), nullable=False),
    )
    op.create_index('ix_refresh_token_blacklist_jti', 'refresh_token_blacklist', ['jti'], unique=True)
    op.create_index('ix_refresh_token_blacklist_expires_at', 'refresh_token_blacklist', ['expires_at'])

def downgrade() -> None:
    op.drop_index('ix_refresh_token_blacklist_expires_at')
    op.drop_index('ix_refresh_token_blacklist_jti')
    op.drop_table('refresh_token_blacklist')