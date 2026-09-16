"""Add details to audit logs.

Revision ID: c3e8a1f4b2d9
Revises: d9d85682bad7
Create Date: 2026-09-16
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "c3e8a1f4b2d9"
down_revision: Union[str, Sequence[str], None] = "7c9e4d82fdee"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("audit_logs", sa.Column("details", sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column("audit_logs", "details")
