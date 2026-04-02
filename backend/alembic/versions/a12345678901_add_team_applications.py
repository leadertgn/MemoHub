"""add team_applications table

Revision ID: a12345678901
Revises: a57e3c89b5fc
Create Date: 2026-04-02 09:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'a12345678901'
down_revision: Union[str, None] = 'a57e3c89b5fc'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create team_applications table
    op.create_table(
        'team_applications',
        sa.Column('id', sa.Integer(), nullable=True),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('role', sa.String(length=50), nullable=False),
        sa.Column('country_id', sa.Integer(), nullable=False),
        sa.Column('student_proof', sa.String(length=255), nullable=False),
        sa.Column('university_id', sa.Integer(), nullable=True),
        sa.Column('motivation', sa.String(length=2000), nullable=False),
        sa.Column('availability', sa.String(length=50), nullable=True),
        sa.Column('status', sa.String(length=50), nullable=False),
        sa.Column('admin_notes', sa.String(length=1000), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('reviewed_at', sa.DateTime(), nullable=True),
        sa.Column('reviewed_by', sa.Integer(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Add foreign key for user_id -> user.id
    op.create_foreign_key(
        'team_applications_user_id_fkey',
        'team_applications', 'user',
        ['user_id'], ['id']
    )
    
    # Add foreign key for country_id -> country.id
    op.create_foreign_key(
        'team_applications_country_id_fkey',
        'team_applications', 'country',
        ['country_id'], ['id']
    )
    
    # Add foreign key for university_id -> university.id
    op.create_foreign_key(
        'team_applications_university_id_fkey',
        'team_applications', 'university',
        ['university_id'], ['id']
    )
    
    # Add foreign key for reviewed_by -> user.id
    op.create_foreign_key(
        'team_applications_reviewed_by_fkey',
        'team_applications', 'user',
        ['reviewed_by'], ['id']
    )


def downgrade() -> None:
    op.drop_constraint('team_applications_reviewed_by_fkey', 'team_applications', type_='foreignkey')
    op.drop_constraint('team_applications_university_id_fkey', 'team_applications', type_='foreignkey')
    op.drop_constraint('team_applications_country_id_fkey', 'team_applications', type_='foreignkey')
    op.drop_constraint('team_applications_user_id_fkey', 'team_applications', type_='foreignkey')
    op.drop_table('team_applications')