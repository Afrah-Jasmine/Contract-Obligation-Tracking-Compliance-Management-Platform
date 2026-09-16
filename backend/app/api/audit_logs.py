from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models.audit_log import AuditLog


router = APIRouter()


@router.get("/")
def get_audit_logs(
    db: Session = Depends(get_db)
):
    logs = (
        db.query(AuditLog)
        .order_by(AuditLog.id.desc())
        .all()
    )

    return [
        {
            "id": log.id,
            "contract_id": log.contract_id,
            "user_id": log.user_id,
            "action": log.action,
            "description": log.description
        }
        for log in logs
    ]