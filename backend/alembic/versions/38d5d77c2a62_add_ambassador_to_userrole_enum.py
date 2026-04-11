"""add_ambassador_to_userrole_enum

Revision ID: 38d5d77c2a62
Revises: ef8d3d250843
Create Date: 2026-04-11 09:33:39.540857

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '38d5d77c2a62'
down_revision: Union[str, Sequence[str], None] = 'ef8d3d250843'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # PostgreSQL ne supporte pas ALTER TYPE dans une transaction
    # Il faut désactiver le mode transactionnel pour cette migration
    op.execute("COMMIT")
    op.execute("ALTER TYPE userrole ADD VALUE IF NOT EXISTS 'ambassador'")

def downgrade() -> None:
    # PostgreSQL ne permet pas de supprimer une valeur d'enum facilement
    # Le downgrade nécessiterait de recréer l'enum entier — on laisse en no-op
    pass
