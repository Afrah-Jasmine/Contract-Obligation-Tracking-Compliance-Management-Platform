from datetime import date, datetime
from typing import Any

from sqlalchemy import inspect
from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog


def snapshot_model(model: Any) -> dict[str, Any]:
    """Return JSON-safe values for the mapped columns on a model."""
    snapshot = {}
    for column in inspect(model).mapper.column_attrs:
        value = getattr(model, column.key)
        if isinstance(value, (date, datetime)):
            value = value.isoformat()
        snapshot[column.key] = value
    return snapshot


def record_audit(
    db: Session,
    *,
    user_id: int,
    action: str,
    entity_type: str,
    entity_id: int | None,
    contract_id: int | None = None,
    old_value: dict[str, Any] | None = None,
    new_value: dict[str, Any] | None = None,
) -> AuditLog:
    entry = AuditLog(
        user_id=user_id,
        contract_id=contract_id,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        old_value=old_value,
        new_value=new_value,
        created_at=datetime.utcnow(),
    )
    db.add(entry)
    return entry
