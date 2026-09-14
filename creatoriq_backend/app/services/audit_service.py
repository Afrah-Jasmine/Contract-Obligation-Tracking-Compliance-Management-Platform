import json
from datetime import datetime

from sqlalchemy.orm import Session

from app.models.activity import Activity
from app.models.audit_log import AuditLog
from app.models.user import User


# ============================================================
# 1. CREATE AUDIT LOG
# ============================================================

def create_audit_log(
    db: Session,
    user_id: int,
    action: str,
    entity_type: str,
    details: dict | str | None = None,
):
    """
    Create an audit log entry for a user action.

    Structured details are stored as JSON so the frontend
    can display meaningful change history.
    """

    if isinstance(details, dict):
        details_value = json.dumps(details)
    else:
        details_value = details

    audit_log = AuditLog(
        user_id=user_id,
        action=action,
        entity_type=entity_type,
        details=details_value,
        created_at=datetime.utcnow(),
    )

    db.add(audit_log)

    return audit_log


# ============================================================
# 2. CREATE USER ACTIVITY
# ============================================================

def create_activity(
    db: Session,
    user_id: int,
    activity_type: str,
    description: str,
):
    """
    Create a user activity entry.
    """

    activity = Activity(
        user_id=user_id,
        activity_type=activity_type,
        description=description,
        created_at=datetime.utcnow(),
    )

    db.add(activity)

    return activity


# ============================================================
# 3. GET AUDIT LOGS
# ============================================================

def get_audit_logs(
    db: Session,
):
    """
    Get audit logs with the associated user's name,
    ordered from newest to oldest.
    """

    return (
        db.query(
            AuditLog.id,
            AuditLog.user_id,
            User.full_name.label("user_name"),
            AuditLog.action,
            AuditLog.entity_type,
            AuditLog.details,
            AuditLog.created_at,
        )
        .join(User, AuditLog.user_id == User.id)
        .order_by(AuditLog.created_at.desc())
        .all()
    )


# ============================================================
# 4. GET ACTIVITIES
# ============================================================

def get_activities(
    db: Session,
):
    """
    Get activities with the associated user's name,
    ordered from newest to oldest.
    """

    return (
        db.query(
            Activity.id,
            Activity.user_id,
            User.full_name.label("user_name"),
            Activity.activity_type,
            Activity.description,
            Activity.created_at,
        )
        .join(User, Activity.user_id == User.id)
        .order_by(Activity.created_at.desc())
        .all()
    )