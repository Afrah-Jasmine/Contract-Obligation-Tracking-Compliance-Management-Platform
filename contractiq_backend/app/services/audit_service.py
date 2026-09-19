from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog


def get_audit_logs(db: Session):
    return (
        db.query(AuditLog)
        .order_by(AuditLog.created_at.desc())
        .all()
    )


def get_audit_log_by_id(db: Session, audit_id: int):
    return (
        db.query(AuditLog)
        .filter(AuditLog.id == audit_id)
        .first()
    )


def log_audit_event(
    db: Session,
    user_id: int,
    action: str,
    entity_name: str,
    entity_id: int,
    contract_id: int | None = None,
    before_data: str | None = None,
    after_data: str | None = None,
    ip_address: str | None = "127.0.0.1",
):
    try:
        audit_entry = AuditLog(
            user_id=user_id,
            contract_id=contract_id,
            action=action,
            entity_name=entity_name,
            entity_id=entity_id,
            before_data=before_data,
            after_data=after_data,
            ip_address=ip_address,
        )
        db.add(audit_entry)
        db.commit()
        db.refresh(audit_entry)
        return audit_entry
    except Exception as exc:
        db.rollback()
        print(f"Error logging audit event: {exc}")
        return None