"""add moderated_by moderated_at columns

Revision ID: aa017522af00
Revises: 14e497455a75
Create Date: 2026-04-01 14:13:37.621642

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'aa017522af00'
down_revision: Union[str, Sequence[str], None] = '14e497455a75'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Add moderated_by and moderated_at to memoir table
    op.add_column('memoir', sa.Column('moderated_by', sa.Integer(), sa.ForeignKey('user.id'), nullable=True))
    op.add_column('memoir', sa.Column('moderated_at', sa.DateTime(), nullable=True))
    
    # Add moderated_by and moderated_at to university table
    op.add_column('university', sa.Column('moderated_by', sa.Integer(), sa.ForeignKey('user.id'), nullable=True))
    op.add_column('university', sa.Column('moderated_at', sa.DateTime(), nullable=True))
    
    # Add moderated_by and moderated_at to fieldofstudy table
    op.add_column('fieldofstudy', sa.Column('moderated_by', sa.Integer(), sa.ForeignKey('user.id'), nullable=True))
    op.add_column('fieldofstudy', sa.Column('moderated_at', sa.DateTime(), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    # Remove from fieldofstudy
    op.drop_column('fieldofstudy', 'moderated_at')
    op.drop_column('fieldofstudy', 'moderated_by')
    
    # Remove from university
    op.drop_column('university', 'moderated_at')
    op.drop_column('university', 'moderated_by')
    
    # Remove from memoir
    op.drop_column('memoir', 'moderated_at')
    op.drop_column('memoir', 'moderated_by')
