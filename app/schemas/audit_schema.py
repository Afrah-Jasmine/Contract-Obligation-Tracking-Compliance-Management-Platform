from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict


class AuditLogResponse(BaseModel):
    id: int
    user_id: int
    user_name: str | None
    user_email: str | None
    action: str
    entity_type: str | None
    entity_id: int | None
    contract_id: int | None
    old_value: dict[str, Any] | None
    new_value: dict[str, Any] | None
    created_at: datetime | None

    model_config = ConfigDict(from_attributes=True)
