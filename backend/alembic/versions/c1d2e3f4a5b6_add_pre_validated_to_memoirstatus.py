"""add_pre_validated_to_memoirstatus_enum

Revision ID: c1d2e3f4a5b6
Revises: 2e4b2409e4f3
Create Date: 2026-04-12 22:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c1d2e3f4a5b6'
down_revision: Union[str, Sequence[str], None] = '2e4b2409e4f3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # PostgreSQL ne supporte pas ALTER TYPE dans une transaction
    # Il faut désactiver le mode transactionnel pour cette migration
    op.execute("COMMIT")
    op.execute("ALTER TYPE memoirstatus ADD VALUE IF NOT EXISTS 'pre_validated'")

def downgrade() -> None:
    # PostgreSQL ne permet pas de supprimer une valeur d'enum facilement
    # Le downgrade nécessiterait de recréer l'enum entier — on laisse en no-op
    pass
