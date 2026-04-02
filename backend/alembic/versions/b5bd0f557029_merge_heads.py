"""merge heads

Revision ID: b5bd0f557029
Revises: a12345678901, aa017522af00
Create Date: 2026-04-02 09:58:09.242018

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b5bd0f557029'
down_revision: Union[str, Sequence[str], None] = ('a12345678901', 'aa017522af00')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
