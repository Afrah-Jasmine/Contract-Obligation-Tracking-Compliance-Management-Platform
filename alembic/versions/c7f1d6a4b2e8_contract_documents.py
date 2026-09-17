"""Add contract upload metadata."""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "c7f1d6a4b2e8"
down_revision: Union[str, Sequence[str], None] = "02402fa124f7"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("contracts", sa.Column("department", sa.String(length=100), nullable=True))
    op.add_column("contract_versions", sa.Column("notes", sa.String(length=500), nullable=True))
    op.add_column(
        "contract_versions",
        sa.Column("uploaded_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
    )


def downgrade() -> None:
    op.drop_column("contract_versions", "uploaded_at")
    op.drop_column("contract_versions", "notes")
    op.drop_column("contracts", "department")