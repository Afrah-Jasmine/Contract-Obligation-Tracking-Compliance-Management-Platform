from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.activity import Activity
from app.models.audit_log import AuditLog
from app.models.user import User
from app.core.deps import get_current_active_user
from app.schemas.activity import ActivityResponse, AuditResponse

router = APIRouter(prefix="/activity", tags=["Audit & Activity"])

@router.get("", response_model=list[ActivityResponse])
def list_activity(current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    return db.query(Activity).filter(Activity.user_id == current_user.id).order_by(Activity.created_at.desc()).limit(100).all()

@router.get("/audit", response_model=list[AuditResponse])
def list_audit(current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    query = db.query(AuditLog)
    if current_user.role.value not in {"Administrator", "Legal Manager", "Compliance Officer"}:
        query = query.filter(AuditLog.user_id == current_user.id)
    return query.order_by(AuditLog.created_at.desc()).limit(200).all()
