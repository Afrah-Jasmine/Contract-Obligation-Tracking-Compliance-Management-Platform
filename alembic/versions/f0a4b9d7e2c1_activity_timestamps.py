"""Add activity timestamps."""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "f0a4b9d7e2c1"
down_revision: Union[str, Sequence[str], None] = "e9f3a8c6d1b0"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    op.add_column("activities", sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")))

def downgrade() -> None:
    op.drop_column("activities", "created_at")