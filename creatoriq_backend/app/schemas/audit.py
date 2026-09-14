from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


# ============================================================
# 1. AUDIT LOG RESPONSE
# ============================================================

class AuditLogResponse(BaseModel):
    id: int
    user_id: int
    user_name: Optional[str] = None
    action: str
    entity_type: str
    details: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ============================================================
# 2. ACTIVITY RESPONSE
# ============================================================

class ActivityResponse(BaseModel):
    id: int
    user_id: int
    user_name: Optional[str] = None
    activity_type: str
    description: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ============================================================
# 3. AUDIT / ACTIVITY HISTORY RESPONSE
# ============================================================

class AuditActivityHistoryResponse(BaseModel):
    audit_logs: list[AuditLogResponse]
    activities: list[ActivityResponse]
