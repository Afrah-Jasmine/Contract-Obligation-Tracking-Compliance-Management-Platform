from sqlalchemy.orm import Session

from app.models.all_models import AuditLog


def record_audit_log(
    db: Session,
    user_id: int | None,
    action: str,
    resource_type: str,
    resource_id: int,
    details: str,
) -> AuditLog:
    audit_log = AuditLog(
        user_id=user_id,
        action=action,
        resource_type=resource_type,
        entity_id=resource_id,
        details=details,
    )
    db.add(audit_log)
    return audit_log
