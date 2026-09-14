from datetime import datetime
from pydantic import BaseModel, ConfigDict

class ActivityResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    user_id: int
    description: str
    entity_type: str | None = None
    entity_id: int | None = None
    created_at: datetime

class AuditResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    user_id: int | None = None
    action: str
    entity_type: str | None = None
    entity_id: int | None = None
    details: str | None = None
    ip_address: str | None = None
    created_at: datetime
