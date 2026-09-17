"""Remove upload-only contract document storage."""
from typing import Sequence, Union

from alembic import op


revision: str = "f13c2d9e4a67"
down_revision: Union[str, Sequence[str], None] = ("02402fa124f7", "f0a4b9d7e2c1")
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_table("contract_versions")


def downgrade() -> None:
    raise RuntimeError("Contract document storage was intentionally removed and cannot be restored automatically.")