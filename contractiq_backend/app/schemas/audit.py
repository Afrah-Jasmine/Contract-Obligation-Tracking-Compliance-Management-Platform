from datetime import datetime
from pydantic import BaseModel, ConfigDict


class AuditLogResponse(BaseModel):
    id: int
    user_id: int
    contract_id: int | None = None
    action: str
    entity_name: str
    entity_id: int
    before_data: str | None = None
    after_data: str | None = None
    ip_address: str | None = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
