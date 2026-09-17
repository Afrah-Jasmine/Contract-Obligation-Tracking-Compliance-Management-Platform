from datetime import date

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.auth import get_current_user
from app.database.database import get_db
from app.models.contract import Contract
from app.models.obligation import Obligation
from app.models.renewal import Renewal
from app.schemas.compliance_schema import ComplianceResponse
from app.services.compliance_service import calculate_compliance
from app.schemas.dashboard_schema import (
    DashboardSummary,
    StatusCount,
    UpcomingRenewal,
)

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"],
)


def _status_counts(db: Session, model) -> dict[str, int]:
    results = (
        db.query(model.status, func.count(model.id))
        .group_by(model.status)
        .all()
    )
    return {status: count for status, count in results if status is not None}


@router.get("/summary", response_model=DashboardSummary)
def dashboard_summary(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    contract_counts = _status_counts(db, Contract)
    obligation_counts = _status_counts(db, Obligation)
    renewal_counts = _status_counts(db, Renewal)
    overdue_obligations = db.query(Obligation).filter(
        Obligation.due_date < date.today(),
        Obligation.status != "Completed",
    ).count()
    expired_renewals = db.query(Renewal).filter(
        Renewal.renewal_date < date.today(),
        Renewal.status.notin_(["Renewed", "Cancelled"]),
    ).count()

    contracts = {
        "total": sum(contract_counts.values()),
        "draft": contract_counts.get("Draft", 0),
        "active": contract_counts.get("Active", 0),
        "expired": contract_counts.get("Expired", 0),
        "under_review": contract_counts.get("Under Review", 0),
        "terminated": contract_counts.get("Terminated", 0),
    }

    obligations = {
        "total": sum(obligation_counts.values()),
        "pending": obligation_counts.get("Pending", 0),
        "completed": obligation_counts.get("Completed", 0),
        "overdue": overdue_obligations,
        "in_progress": obligation_counts.get("In Progress", 0),
    }

    renewals = {
        "total": sum(renewal_counts.values()),
        "upcoming": renewal_counts.get("Upcoming", 0),
        "renewed": renewal_counts.get("Renewed", 0),
        "expired": max(renewal_counts.get("Expired", 0), expired_renewals),
        "in_progress": renewal_counts.get("In Progress", 0),
    }

    return {
        "contracts": contracts,
        "obligations": obligations,
        "renewals": renewals,
    }


@router.get(
    "/contract-status",
    response_model=list[StatusCount],
)
def contract_status(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    results = (
        db.query(
            Contract.status,
            func.count(Contract.id)
        )
        .group_by(Contract.status)
        .order_by(Contract.status)
        .all()
    )

    return [
        StatusCount(
            status=status,
            count=count
        )
        for status, count in results
    ]


@router.get(
    "/obligation-status",
    response_model=list[StatusCount],
)
def obligation_status(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    results = (
        db.query(Obligation.status, func.count(Obligation.id))
        .group_by(Obligation.status)
        .order_by(Obligation.status)
        .all()
    )
    return [StatusCount(status=status, count=count) for status, count in results]


@router.get(
    "/upcoming-renewals",
    response_model=list[UpcomingRenewal],
)
def upcoming_renewals(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    results = (
        db.query(Renewal, Contract.title)
        .join(Contract, Renewal.contract_id == Contract.id)
        .filter(Renewal.status == "Upcoming", Renewal.renewal_date >= date.today())
        .order_by(Renewal.renewal_date)
        .all()
    )
    return [
        UpcomingRenewal(
            id=renewal.id,
            contract_id=renewal.contract_id,
            contract_title=contract_title,
            renewal_date=renewal.renewal_date,
            previous_expiry_date=renewal.previous_expiry_date,
            new_expiry_date=renewal.new_expiry_date,
            status=renewal.status,
        )
        for renewal, contract_title in results
    ]


@router.get("/compliance-status", response_model=list[ComplianceResponse])
def dashboard_compliance_status(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return [
        {
            "contract_id": contract.id,
            "contract_title": contract.title,
            **calculate_compliance(contract),
        }
        for contract in db.query(Contract).all()
    ]
