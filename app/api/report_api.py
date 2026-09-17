import json
from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.core.auth import get_current_user
from app.database.database import get_db
from app.models.report import Report
from app.schemas.report_schema import ReportCreate, ReportResponse
from app.models.contract import Contract
from app.models.obligation import Obligation
from app.models.renewal import Renewal
from app.models.audit_log import AuditLog


router = APIRouter(
    prefix="/reports",
    tags=["Reports"]
)


@router.post(
    "",
    response_model=ReportResponse,
    status_code=status.HTTP_201_CREATED
)
def create_report(
    report_data: ReportCreate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    payload = {"report_type": report_data.report_type, "records": []}
    if report_data.report_type == "Compliance Report":
        from app.services.compliance_service import calculate_compliance
        payload["records"] = [{"contract_id": contract.id, "title": contract.title, **calculate_compliance(contract)} for contract in db.query(Contract).all()]
    elif report_data.report_type == "Contract Report":
        payload["records"] = [{"id": item.id, "title": item.title, "status": item.status} for item in db.query(Contract).all()]
    elif report_data.report_type == "Obligation Report":
        payload["records"] = [{"id": item.id, "title": item.title, "status": item.status, "due_date": str(item.due_date)} for item in db.query(Obligation).all()]
    elif report_data.report_type == "Renewal Report":
        payload["records"] = [{"id": item.id, "status": item.status, "renewal_date": str(item.renewal_date)} for item in db.query(Renewal).all()]
    elif report_data.report_type == "Audit Report":
        payload["records"] = [{"id": item.id, "action": item.action, "table_name": item.table_name} for item in db.query(AuditLog).all()]
    report_dir = Path("uploads/reports")
    report_dir.mkdir(parents=True, exist_ok=True)
    stored_path = report_dir / f"{uuid4().hex}.json"
    stored_path.write_text(json.dumps(payload, default=str, indent=2), encoding="utf-8")
    report = Report(
        generated_by=current_user.id,
        report_name=report_data.report_name,
        report_type=report_data.report_type,
        file_path=str(stored_path).replace("\\", "/")
    )

    db.add(report)
    db.commit()
    db.refresh(report)

    return report


@router.get("/{report_id}/download")
def download_report(
    report_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    path = Path(report.file_path).resolve()
    report_root = Path("uploads/reports").resolve()
    if report_root not in path.parents or not path.is_file():
        raise HTTPException(status_code=404, detail="Report file not found")
    return FileResponse(path, filename=f"{report.report_name}.json", media_type="application/json")


@router.get(
    "/",
    response_model=list[ReportResponse]
)
def get_reports(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(Report).all()


@router.get(
    "/{report_id}",
    response_model=ReportResponse
)
def get_report(
    report_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    report = db.query(Report).filter(
        Report.id == report_id
    ).first()

    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found"
        )

    return report
