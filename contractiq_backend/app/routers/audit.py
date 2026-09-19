from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.audit_log import AuditLog
from app.schemas.audit import AuditLogResponse
from app.services.audit_service import (
    get_audit_logs,
    get_audit_log_by_id
)
from app.core.dependencies import get_current_user
from app.models.user import User


router = APIRouter(
    prefix="/audit",
    tags=["Audit History"]
)


@router.get(
    "/",
    response_model=list[AuditLogResponse]
)
def get_all_audit_logs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_audit_logs(db)


@router.get(
    "/{audit_id}",
    response_model=AuditLogResponse
)
def get_single_audit_log(
    audit_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    audit_log = get_audit_log_by_id(db, audit_id)

    if audit_log is None:
        raise HTTPException(
            status_code=404,
            detail="Audit log not found"
        )

    return audit_log