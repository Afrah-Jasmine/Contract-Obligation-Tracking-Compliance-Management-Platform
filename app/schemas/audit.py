from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class AuditLogResponse(BaseModel):
    id: int
    timestamp: datetime
    user_id: Optional[int] = None
    user: Optional[str] = None
    action: str
    resource_type: str
    details: Optional[str] = None

    class Config:
        from_attributes = True
