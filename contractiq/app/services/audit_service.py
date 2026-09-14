import json
from typing import Any

from sqlalchemy.orm import Session

from app.models.activity import Activity
from app.models.audit_log import AuditLog
from app.models.user import User

def record_event(
    db: Session,
    user: User,
    action: str,
    entity_type: str,
    entity_id: int | None = None,
    details: str | dict[str, Any] | None = None,
) -> None:
    detail_text = json.dumps(details, default=str) if isinstance(details, dict) else details
    db.add(Activity(
        user_id=user.id,
        description=f"{action.replace('_', ' ').title()} {entity_type}{f' #{entity_id}' if entity_id else ''}",
        entity_type=entity_type,
        entity_id=entity_id,
    ))
    db.add(AuditLog(
        user_id=user.id,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        details=detail_text,
    ))
