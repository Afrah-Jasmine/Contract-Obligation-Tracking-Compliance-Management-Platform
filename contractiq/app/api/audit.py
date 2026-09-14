from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.core.deps import get_current_active_user
from app.models.activity import Activity
from app.models.audit_log import AuditLog
from app.models.user import User
from app.schemas.audit import ActivityResponse, AuditLogResponse

router = APIRouter(tags=["Audit & Activity"])

@router.get("/activity", response_model=list[ActivityResponse])
def get_activity(
    limit: int = Query(100, ge=1, le=500),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    query = (
        db.query(Activity, User.full_name)
        .join(User, Activity.user_id == User.id)
        .order_by(Activity.created_at.desc())
        .limit(limit)
    )
    if current_user.role.value != "Administrator":
        query = query.filter(Activity.user_id == current_user.id)
    rows = query.all()
    return [
        {
            "id": row.Activity.id, "user_id": row.Activity.user_id,
            "user_name": row.full_name, "description": row.Activity.description,
            "entity_type": row.Activity.entity_type, "entity_id": row.Activity.entity_id,
            "created_at": row.Activity.created_at,
        } for row in rows
    ]

@router.get("/audit", response_model=list[AuditLogResponse])
def get_audit(
    limit: int = Query(100, ge=1, le=500),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    # Users see their own audit records; administrators see the complete audit trail.
    query = (
        db.query(AuditLog, User.full_name)
        .outerjoin(User, AuditLog.user_id == User.id)
        .order_by(AuditLog.created_at.desc())
        .limit(limit)
    )
    if current_user.role.value != "Administrator":
        query = query.filter(AuditLog.user_id == current_user.id)
    rows = query.all()
    return [
        {
            "id": row.AuditLog.id, "user_id": row.AuditLog.user_id,
            "user_name": row.full_name, "action": row.AuditLog.action,
            "entity_type": row.AuditLog.entity_type, "entity_id": row.AuditLog.entity_id,
            "details": row.AuditLog.details, "ip_address": row.AuditLog.ip_address,
            "created_at": row.AuditLog.created_at,
        } for row in rows
    ]
