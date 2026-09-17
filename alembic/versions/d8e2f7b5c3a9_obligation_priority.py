"""Add obligation priority."""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "d8e2f7b5c3a9"
down_revision: Union[str, Sequence[str], None] = "c7f1d6a4b2e8"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("obligations", sa.Column("priority", sa.String(length=20), nullable=True))


def downgrade() -> None:
    op.drop_column("obligations", "priority")