from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, require_permission
from app.database.database import get_db
from app.models.user import User
from app.schemas.audit import (
    ActivityResponse,
    AuditActivityHistoryResponse,
    AuditLogResponse,
)
from app.schemas.permissions import Permission
from app.services.audit_service import (
    get_activities,
    get_audit_logs,
)


router = APIRouter(
    prefix="/audit",
    tags=["Audit & Activity History"]
)


# ============================================================
# 1. GET AUDIT LOGS
# GET /audit/logs
# ============================================================

@router.get(
    "/logs",
    response_model=list[AuditLogResponse],
    status_code=status.HTTP_200_OK,
)
def get_audit_logs_api(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_permission(Permission.VIEW_AUDIT_LOGS)
    ),
):
    return get_audit_logs(db)


# ============================================================
# 2. GET ACTIVITIES
# GET /audit/activities
# ============================================================

@router.get(
    "/activities",
    response_model=list[ActivityResponse],
    status_code=status.HTTP_200_OK,
)
def get_activities_api(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_permission(Permission.VIEW_AUDIT_LOGS)
    ),
):
    return get_activities(db)


# ============================================================
# 3. GET COMBINED AUDIT / ACTIVITY HISTORY
# GET /audit
# ============================================================

@router.get(
    "",
    response_model=AuditActivityHistoryResponse,
    status_code=status.HTTP_200_OK,
)
def get_audit_activity_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_permission(Permission.VIEW_AUDIT_LOGS)
    ),
):
    return {
        "audit_logs": get_audit_logs(db),
        "activities": get_activities(db),
    }
