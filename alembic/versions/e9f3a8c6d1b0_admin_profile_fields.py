"""Add administrator profile fields."""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "e9f3a8c6d1b0"
down_revision: Union[str, Sequence[str], None] = "d8e2f7b5c3a9"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    op.add_column("users", sa.Column("avatar_url", sa.String(length=500), nullable=True))
    op.add_column("users", sa.Column("last_login", sa.DateTime(timezone=True), nullable=True))
    op.add_column("users", sa.Column("preferences", sa.JSON(), nullable=True))
    op.add_column("users", sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")))
    op.add_column("users", sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()")))

def downgrade() -> None:
    for column in ("updated_at", "created_at", "preferences", "last_login", "avatar_url"):
        op.drop_column("users", column)