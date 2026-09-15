from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

class ActivityResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    user_id: int
    user_name: str
    description: str
    entity_type: Optional[str] = None
    entity_id: Optional[int] = None
    created_at: datetime

class AuditLogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    user_id: Optional[int] = None
    user_name: Optional[str] = None
    action: str
    entity_type: Optional[str] = None
    entity_id: Optional[int] = None
    details: Optional[str] = None
    ip_address: Optional[str] = None
    created_at: datetime
