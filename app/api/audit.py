from datetime import datetime

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session, joinedload

from app.database.database import get_db
from app.middleware.auth import require_roles
from app.models.audit_log import AuditLog
from app.schemas.audit_schema import AuditLogResponse


router = APIRouter(
    prefix="/audit",
    tags=["Audit History"],
)

AUDIT_VIEW_ROLES = ("Administrator", "Legal Manager")


@router.get(
    "",
    response_model=list[AuditLogResponse],
    status_code=status.HTTP_200_OK,
)
def get_audit_history(
    user_id: int | None = None,
    action: str | None = None,
    entity_type: str | None = None,
    from_date: datetime | None = None,
    to_date: datetime | None = None,
    offset: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    current_user: dict = Depends(require_roles(*AUDIT_VIEW_ROLES)),
    db: Session = Depends(get_db),
):
    """Return audit history for administrators and legal managers.

    The project does not define a separate audit permission, so this policy
    limits sensitive historical records to the two roles responsible for
    governance and legal oversight.
    """
    query = db.query(AuditLog).options(joinedload(AuditLog.user))

    if user_id is not None:
        query = query.filter(AuditLog.user_id == user_id)
    if action is not None:
        query = query.filter(AuditLog.action == action)
    if entity_type is not None:
        query = query.filter(AuditLog.entity_type == entity_type)
    if from_date is not None:
        query = query.filter(AuditLog.created_at >= from_date)
    if to_date is not None:
        query = query.filter(AuditLog.created_at <= to_date)

    records = (
        query.order_by(AuditLog.created_at.desc().nullslast(), AuditLog.id.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

    return [
        AuditLogResponse(
            id=record.id,
            user_id=record.user_id,
            user_name=record.user.full_name if record.user else None,
            user_email=record.user.email if record.user else None,
            action=record.action,
            entity_type=record.entity_type,
            entity_id=record.entity_id,
            contract_id=record.contract_id,
            old_value=record.old_value,
            new_value=record.new_value,
            created_at=record.created_at,
        )
        for record in records
    ]
