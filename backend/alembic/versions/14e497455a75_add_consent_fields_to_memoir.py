"""add consent fields to memoir

Revision ID: 14e497455a75
Revises: 54acef10eacb
Create Date: 2026-03-25 23:07:12.132665

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '14e497455a75'
down_revision: Union[str, Sequence[str], None] = '54acef10eacb'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('memoir',
        sa.Column('accepted_terms', sa.Boolean(), nullable=False, server_default='false')
    )
    op.add_column('memoir',
        sa.Column('allow_download', sa.Boolean(), nullable=False, server_default='true')
    )

def downgrade() -> None:
    op.drop_column('memoir', 'allow_download')
    op.drop_column('memoir', 'accepted_terms')
