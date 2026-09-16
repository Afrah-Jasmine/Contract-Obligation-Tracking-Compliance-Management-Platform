from typing import List
from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.database.database import get_db
from app.models.user import User
from app.schemas.report import (
    ComplianceAnalyticsSummary,
    ComplianceReportItem,
    ContractAnalyticsSummary,
    ContractReportItem,
    DashboardSummaryResponse,
    DepartmentAnalyticsSummary,
    ObligationAnalyticsSummary,
    ObligationReportItem,
    RenewalAnalyticsSummary,
    RenewalReportItem,
    RiskContractSummary,
)
from app.services import report_service

router = APIRouter(
    tags=["Reports & Analytics"]
)


# ----------------------------------------------------------------------
# 1. Dashboard & Analytics Endpoints
# ----------------------------------------------------------------------

@router.get(
    "/dashboard/summary",
    response_model=DashboardSummaryResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Dashboard Summary Overview",
    description="Provides overall metrics summary across contracts, obligations, renewals, and compliance for ContractIQ dashboard."
)
def get_dashboard_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve top-level dashboard summary metrics."""
    return report_service.get_dashboard_summary(db)


@router.get(
    "/reports/dashboard/summary",
    response_model=DashboardSummaryResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Dashboard Summary Overview Alias",
    include_in_schema=False
)
def get_dashboard_summary_alias(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return report_service.get_dashboard_summary(db)


@router.get(
    "/reports/contracts/summary",
    response_model=ContractAnalyticsSummary,
    status_code=status.HTTP_200_OK,
    summary="Get Contract Analytics Summary",
    description="Provides contract distribution by status and category breakdown."
)
def get_contract_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve contract analytics metrics."""
    return report_service.get_contract_summary(db)


@router.get(
    "/reports/obligations/summary",
    response_model=ObligationAnalyticsSummary,
    status_code=status.HTTP_200_OK,
    summary="Get Obligation Analytics Summary",
    description="Provides obligation status breakdown including pending, in-progress, completed, and overdue metrics."
)
def get_obligation_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve obligation analytics metrics."""
    return report_service.get_obligation_summary(db)


@router.get(
    "/reports/renewals/summary",
    response_model=RenewalAnalyticsSummary,
    status_code=status.HTTP_200_OK,
    summary="Get Renewal Analytics Summary",
    description="Provides renewal metrics and a list of contracts approaching their expiry dates."
)
def get_renewal_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve renewal analytics metrics and upcoming expiry list."""
    return report_service.get_renewal_summary(db)


@router.get(
    "/reports/compliance/summary",
    response_model=ComplianceAnalyticsSummary,
    status_code=status.HTTP_200_OK,
    summary="Get Compliance Analytics Summary",
    description="Provides compliance evaluation statistics, non-compliant contract counts, and average compliance score."
)
def get_compliance_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve compliance evaluation summary."""
    return report_service.get_compliance_summary(db)


@router.get(
    "/reports/risk",
    response_model=List[RiskContractSummary],
    status_code=status.HTTP_200_OK,
    summary="Get Risk Analysis",
    description="Identifies contracts that require immediate attention due to high compliance risk or overdue obligations."
)
def get_risk_analysis(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve list of high-risk contracts."""
    return report_service.get_risk_summary(db)


@router.get(
    "/reports/departments/summary",
    response_model=DepartmentAnalyticsSummary,
    status_code=status.HTTP_200_OK,
    summary="Get Department Performance Analysis",
    description="Provides department-level statistics for contract count, total obligations, and overdue obligations."
)
def get_department_performance(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve department performance breakdown."""
    return report_service.get_department_summary(db)


# ----------------------------------------------------------------------
# 2. Detailed Report Record Endpoints
# ----------------------------------------------------------------------

@router.get(
    "/reports/contracts",
    response_model=List[ContractReportItem],
    status_code=status.HTTP_200_OK,
    summary="Get Contract Report Records"
)
def get_contract_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return report_service.get_contract_report_items(db)


@router.get(
    "/reports/obligations",
    response_model=List[ObligationReportItem],
    status_code=status.HTTP_200_OK,
    summary="Get Obligation Report Records"
)
def get_obligation_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return report_service.get_obligation_report_items(db)


@router.get(
    "/reports/renewals",
    response_model=List[RenewalReportItem],
    status_code=status.HTTP_200_OK,
    summary="Get Renewal Report Records"
)
def get_renewal_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return report_service.get_renewal_report_items(db)


@router.get(
    "/reports/compliance",
    response_model=List[ComplianceReportItem],
    status_code=status.HTTP_200_OK,
    summary="Get Compliance Report Records"
)
def get_compliance_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return report_service.get_compliance_report_items(db)


# ----------------------------------------------------------------------
# 3. PDF Report Export Endpoints
# ----------------------------------------------------------------------

@router.get(
    "/reports/contracts/export/pdf",
    summary="Export Contract Report as PDF",
    response_class=Response
)
def export_contracts_pdf(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    summary = report_service.get_contract_summary(db)
    items = report_service.get_contract_report_items(db)

    headers = ["Contract #", "Title", "Category", "Status", "Start Date", "End Date", "Assigned User"]
    rows = [
        [i.contract_number, i.title, i.category, i.status, str(i.start_date or "-"), str(i.end_date or "-"), i.assigned_user]
        for i in items
    ]
    summary_lines = [
        f"Total Contracts: {summary.total_contracts} | Active: {summary.active_contracts} | Draft: {summary.draft_contracts} | Expired: {summary.expired_contracts}"
    ]

    pdf_bytes = report_service.generate_pdf_bytes("Contract Analytics Report", headers, rows, summary_lines)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=ContractIQ_Contracts_Report.pdf"}
    )


@router.get(
    "/reports/obligations/export/pdf",
    summary="Export Obligation Report as PDF",
    response_class=Response
)
def export_obligations_pdf(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    summary = report_service.get_obligation_summary(db)
    items = report_service.get_obligation_report_items(db)

    headers = ["Contract #", "Obligation Title", "Type", "Assigned To", "Due Date", "Status", "Completion Date"]
    rows = [
        [i.contract_number, i.obligation_title, i.obligation_type, i.assigned_user, str(i.due_date or "-"), i.status, str(i.completion_date or "-")]
        for i in items
    ]
    summary_lines = [
        f"Total Obligations: {summary.total_obligations} | Completed: {summary.completed_obligations} | Pending: {summary.pending_obligations} | Overdue: {summary.overdue_obligations}"
    ]

    pdf_bytes = report_service.generate_pdf_bytes("Obligation Tracking Report", headers, rows, summary_lines)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=ContractIQ_Obligations_Report.pdf"}
    )


@router.get(
    "/reports/renewals/export/pdf",
    summary="Export Renewal Report as PDF",
    response_class=Response
)
def export_renewals_pdf(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    summary = report_service.get_renewal_summary(db)
    items = report_service.get_renewal_report_items(db)

    headers = ["Contract #", "Prev Expiry Date", "Renewal Date", "New Expiry Date", "Status", "Assigned User"]
    rows = [
        [i.contract_number, str(i.previous_expiry_date or "-"), str(i.renewal_date or "-"), str(i.new_expiry_date or "-"), i.renewal_status, i.assigned_user]
        for i in items
    ]
    summary_lines = [
        f"Upcoming Renewals: {summary.upcoming_renewals} | In Progress: {summary.renewals_in_progress} | Renewed: {summary.renewed_contracts} | Expired: {summary.expired_renewals}"
    ]

    pdf_bytes = report_service.generate_pdf_bytes("Contract Renewal Report", headers, rows, summary_lines)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=ContractIQ_Renewals_Report.pdf"}
    )


@router.get(
    "/reports/compliance/export/pdf",
    summary="Export Compliance Report as PDF",
    response_class=Response
)
def export_compliance_pdf(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    summary = report_service.get_compliance_summary(db)
    items = report_service.get_compliance_report_items(db)

    headers = ["Contract #", "Status", "Score", "Overdue Obligations", "Risk Level", "Evaluated At"]
    rows = [
        [i.contract_number, i.compliance_status, f"{i.compliance_score}%", i.overdue_obligations, i.risk_level, str(i.evaluation_date.strftime('%Y-%m-%d') if i.evaluation_date else "-")]
        for i in items
    ]
    summary_lines = [
        f"Evaluated: {summary.total_contracts_evaluated} | Compliant: {summary.compliant_contracts} | Non-Compliant: {summary.non_compliant_contracts} | High Risk: {summary.high_risk_contracts} | Average Score: {summary.average_compliance_score}%"
    ]

    pdf_bytes = report_service.generate_pdf_bytes("Compliance & Risk Report", headers, rows, summary_lines)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=ContractIQ_Compliance_Report.pdf"}
    )


# ----------------------------------------------------------------------
# 4. Excel Report Export Endpoints
# ----------------------------------------------------------------------

@router.get(
    "/reports/contracts/export/excel",
    summary="Export Contract Report as Excel",
    response_class=Response
)
def export_contracts_excel(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    summary = report_service.get_contract_summary(db)
    items = report_service.get_contract_report_items(db)

    headers = ["Contract #", "Title", "Category", "Status", "Start Date", "End Date", "Assigned User"]
    rows = [
        [i.contract_number, i.title, i.category, i.status, str(i.start_date or "-"), str(i.end_date or "-"), i.assigned_user]
        for i in items
    ]
    summary_lines = [
        f"Total Contracts: {summary.total_contracts} | Active: {summary.active_contracts} | Draft: {summary.draft_contracts} | Expired: {summary.expired_contracts}"
    ]

    excel_bytes = report_service.generate_excel_bytes("Contracts Report", headers, rows, summary_lines)
    return Response(
        content=excel_bytes,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=ContractIQ_Contracts_Report.xlsx"}
    )


@router.get(
    "/reports/obligations/export/excel",
    summary="Export Obligation Report as Excel",
    response_class=Response
)
def export_obligations_excel(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    summary = report_service.get_obligation_summary(db)
    items = report_service.get_obligation_report_items(db)

    headers = ["Contract #", "Obligation Title", "Type", "Assigned To", "Due Date", "Status", "Completion Date"]
    rows = [
        [i.contract_number, i.obligation_title, i.obligation_type, i.assigned_user, str(i.due_date or "-"), i.status, str(i.completion_date or "-")]
        for i in items
    ]
    summary_lines = [
        f"Total Obligations: {summary.total_obligations} | Completed: {summary.completed_obligations} | Pending: {summary.pending_obligations} | Overdue: {summary.overdue_obligations}"
    ]

    excel_bytes = report_service.generate_excel_bytes("Obligations Report", headers, rows, summary_lines)
    return Response(
        content=excel_bytes,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=ContractIQ_Obligations_Report.xlsx"}
    )


@router.get(
    "/reports/renewals/export/excel",
    summary="Export Renewal Report as Excel",
    response_class=Response
)
def export_renewals_excel(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    summary = report_service.get_renewal_summary(db)
    items = report_service.get_renewal_report_items(db)

    headers = ["Contract #", "Prev Expiry Date", "Renewal Date", "New Expiry Date", "Status", "Assigned User"]
    rows = [
        [i.contract_number, str(i.previous_expiry_date or "-"), str(i.renewal_date or "-"), str(i.new_expiry_date or "-"), i.renewal_status, i.assigned_user]
        for i in items
    ]
    summary_lines = [
        f"Upcoming Renewals: {summary.upcoming_renewals} | In Progress: {summary.renewals_in_progress} | Renewed: {summary.renewed_contracts} | Expired: {summary.expired_renewals}"
    ]

    excel_bytes = report_service.generate_excel_bytes("Renewals Report", headers, rows, summary_lines)
    return Response(
        content=excel_bytes,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=ContractIQ_Renewals_Report.xlsx"}
    )


@router.get(
    "/reports/compliance/export/excel",
    summary="Export Compliance Report as Excel",
    response_class=Response
)
def export_compliance_excel(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    summary = report_service.get_compliance_summary(db)
    items = report_service.get_compliance_report_items(db)

    headers = ["Contract #", "Status", "Score", "Overdue Obligations", "Risk Level", "Evaluated At"]
    rows = [
        [i.contract_number, i.compliance_status, f"{i.compliance_score}%", i.overdue_obligations, i.risk_level, str(i.evaluation_date.strftime('%Y-%m-%d') if i.evaluation_date else "-")]
        for i in items
    ]
    summary_lines = [
        f"Evaluated: {summary.total_contracts_evaluated} | Compliant: {summary.compliant_contracts} | Non-Compliant: {summary.non_compliant_contracts} | High Risk: {summary.high_risk_contracts} | Average Score: {summary.average_compliance_score}%"
    ]

    excel_bytes = report_service.generate_excel_bytes("Compliance Report", headers, rows, summary_lines)
    return Response(
        content=excel_bytes,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=ContractIQ_Compliance_Report.xlsx"}
    )
