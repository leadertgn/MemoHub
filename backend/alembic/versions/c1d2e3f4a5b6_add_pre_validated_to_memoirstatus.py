"""add_pre_validated_to_memoirstatus_enum

Revision ID: c1d2e3f4a5b6
Revises: 38d5d77c2a62, 14e497455a75
Create Date: 2026-04-12 22:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c1d2e3f4a5b6'
# Fusion des deux têtes existantes :
#   38d5d77c2a62 = add_ambassador_to_userrole_enum (branche principale)
#   14e497455a75 = add_consent_fields_to_memoir    (branche secondaire non fusionnée)
down_revision: Union[str, Sequence[str], None] = ('38d5d77c2a62', '14e497455a75')
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
