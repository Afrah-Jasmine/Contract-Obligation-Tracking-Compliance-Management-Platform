from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.database.database import get_db
from app.models.all_models import AuditLog, User
from app.schemas.audit import AuditLogResponse

router = APIRouter(tags=["Audit History"])


@router.get("/audit-logs", response_model=List[AuditLogResponse])
def get_audit_logs(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    logs = (
        db.query(AuditLog, User.full_name)
        .outerjoin(User, AuditLog.user_id == User.id)
        .order_by(AuditLog.timestamp.desc(), AuditLog.id.desc())
        .all()
    )
    return [
        {
            "id": log.id,
            "timestamp": log.timestamp,
            "user_id": log.user_id,
            "user": full_name,
            "action": log.action,
            "resource_type": log.resource_type,
            "details": log.details,
        }
        for log, full_name in logs
    ]
