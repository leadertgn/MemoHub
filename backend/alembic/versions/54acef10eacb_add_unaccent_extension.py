"""add unaccent extension

Revision ID: 54acef10eacb
Revises: a57e3c89b5fc
Create Date: 2026-03-24 08:45:54.704854

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '54acef10eacb'
down_revision: Union[str, Sequence[str], None] = 'a57e3c89b5fc'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS unaccent")

def downgrade() -> None:
    op.execute("DROP EXTENSION IF EXISTS unaccent")