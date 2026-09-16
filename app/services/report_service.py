import io
from datetime import date, datetime, timedelta
from typing import Dict, List, Optional
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.models.compliance import ComplianceRecord
from app.models.contract import Contract
from app.models.obligation import Obligation
from app.models.renewal import Renewal
from app.models.user import User
from app.schemas.report import (
    ComplianceAnalyticsSummary,
    ComplianceReportItem,
    ContractAnalyticsSummary,
    ContractApproachingExpiry,
    ContractReportItem,
    DashboardComplianceSummary,
    DashboardContractSummary,
    DashboardObligationSummary,
    DashboardRenewalSummary,
    DashboardSummaryResponse,
    DepartmentAnalyticsSummary,
    DepartmentSummaryItem,
    ObligationAnalyticsSummary,
    ObligationReportItem,
    RenewalAnalyticsSummary,
    RenewalReportItem,
    RiskContractSummary,
)
from app.services import compliance_service

# ReportLab imports for PDF generation
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.platypus import HRFlowable, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

# OpenPyXL imports for Excel generation
import openpyxl
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter


# ----------------------------------------------------------------------
# Dashboard & Summary Analytics
# ----------------------------------------------------------------------

def get_dashboard_summary(db: Session) -> DashboardSummaryResponse:
    today = date.today()

    # 1. Contracts Summary
    c_total = db.query(func.count(Contract.id)).scalar() or 0
    c_active = db.query(func.count(Contract.id)).filter(Contract.status == "Active").scalar() or 0
    c_draft = db.query(func.count(Contract.id)).filter(Contract.status == "Draft").scalar() or 0
    c_under_review = db.query(func.count(Contract.id)).filter(Contract.status == "Under Review").scalar() or 0
    c_approved = db.query(func.count(Contract.id)).filter(Contract.status == "Approved").scalar() or 0
    c_expired = db.query(func.count(Contract.id)).filter(Contract.status == "Expired").scalar() or 0
    c_terminated = db.query(func.count(Contract.id)).filter(Contract.status == "Terminated").scalar() or 0

    contract_sum = DashboardContractSummary(
        total=c_total,
        active=c_active,
        draft=c_draft,
        under_review=c_under_review,
        approved=c_approved,
        expired=c_expired,
        terminated=c_terminated
    )

    # 2. Obligations Summary
    o_total = db.query(func.count(Obligation.obligation_id)).scalar() or 0
    o_pending = db.query(func.count(Obligation.obligation_id)).filter(Obligation.status == "Pending").scalar() or 0
    o_in_progress = db.query(func.count(Obligation.obligation_id)).filter(Obligation.status == "In Progress").scalar() or 0
    o_completed = db.query(func.count(Obligation.obligation_id)).filter(Obligation.status == "Completed").scalar() or 0
    o_delayed = db.query(func.count(Obligation.obligation_id)).filter(Obligation.status == "Delayed").scalar() or 0

    # Overdue = explicit status 'Overdue' OR (due_date < today AND status != 'Completed')
    o_overdue = db.query(func.count(Obligation.obligation_id)).filter(
        or_(
            Obligation.status == "Overdue",
            (Obligation.due_date < today) & (Obligation.status != "Completed")
        )
    ).scalar() or 0

    obligation_sum = DashboardObligationSummary(
        total=o_total,
        pending=o_pending,
        in_progress=o_in_progress,
        completed=o_completed,
        overdue=o_overdue,
        delayed=o_delayed
    )

    # 3. Renewals Summary
    r_upcoming = db.query(func.count(Renewal.id)).filter(
        or_(Renewal.status == "Upcoming", Renewal.status == "Pending")
    ).scalar() or 0
    r_in_progress = db.query(func.count(Renewal.id)).filter(
        or_(Renewal.status == "In Progress", Renewal.status == "Under Review")
    ).scalar() or 0
    r_renewed = db.query(func.count(Renewal.id)).filter(Renewal.status == "Renewed").scalar() or 0
    r_expired = db.query(func.count(Renewal.id)).filter(Renewal.status == "Expired").scalar() or 0
    r_cancelled = db.query(func.count(Renewal.id)).filter(
        or_(Renewal.status == "Cancelled", Renewal.status == "Canceled")
    ).scalar() or 0

    renewal_sum = DashboardRenewalSummary(
        upcoming=r_upcoming,
        in_progress=r_in_progress,
        renewed=r_renewed,
        expired=r_expired,
        cancelled=r_cancelled
    )

    # 4. Compliance Summary
    comp_records = db.query(ComplianceRecord).all()
    if not comp_records:
        # Run bulk evaluation to populate initial metrics if empty
        compliance_service.get_all_compliance_records(db)
        comp_records = db.query(ComplianceRecord).all()

    comp_compliant = sum(1 for r in comp_records if r.compliance_status == "Compliant")
    comp_pending = sum(1 for r in comp_records if r.compliance_status == "Pending")
    comp_delayed = sum(1 for r in comp_records if r.compliance_status == "Delayed")
    comp_non_compliant = sum(1 for r in comp_records if r.compliance_status in ["Non-Compliant", "Non Compliant"])
    comp_high_risk = sum(1 for r in comp_records if r.risk_level == "High")

    compliance_sum = DashboardComplianceSummary(
        compliant=comp_compliant,
        pending=comp_pending,
        delayed=comp_delayed,
        non_compliant=comp_non_compliant,
        high_risk=comp_high_risk
    )

    return DashboardSummaryResponse(
        contracts=contract_sum,
        obligations=obligation_sum,
        renewals=renewal_sum,
        compliance=compliance_sum
    )


def get_contract_summary(db: Session) -> ContractAnalyticsSummary:
    c_total = db.query(func.count(Contract.id)).scalar() or 0
    c_active = db.query(func.count(Contract.id)).filter(Contract.status == "Active").scalar() or 0
    c_draft = db.query(func.count(Contract.id)).filter(Contract.status == "Draft").scalar() or 0
    c_under_review = db.query(func.count(Contract.id)).filter(Contract.status == "Under Review").scalar() or 0
    c_approved = db.query(func.count(Contract.id)).filter(Contract.status == "Approved").scalar() or 0
    c_expired = db.query(func.count(Contract.id)).filter(Contract.status == "Expired").scalar() or 0
    c_terminated = db.query(func.count(Contract.id)).filter(Contract.status == "Terminated").scalar() or 0

    category_counts = db.query(Contract.category, func.count(Contract.id)).group_by(Contract.category).all()
    contracts_by_category = {cat: count for cat, count in category_counts if cat}

    return ContractAnalyticsSummary(
        total_contracts=c_total,
        active_contracts=c_active,
        draft_contracts=c_draft,
        under_review_contracts=c_under_review,
        approved_contracts=c_approved,
        expired_contracts=c_expired,
        terminated_contracts=c_terminated,
        contracts_by_category=contracts_by_category
    )


def get_obligation_summary(db: Session) -> ObligationAnalyticsSummary:
    today = date.today()
    o_total = db.query(func.count(Obligation.obligation_id)).scalar() or 0
    o_pending = db.query(func.count(Obligation.obligation_id)).filter(Obligation.status == "Pending").scalar() or 0
    o_in_progress = db.query(func.count(Obligation.obligation_id)).filter(Obligation.status == "In Progress").scalar() or 0
    o_completed = db.query(func.count(Obligation.obligation_id)).filter(Obligation.status == "Completed").scalar() or 0
    o_delayed = db.query(func.count(Obligation.obligation_id)).filter(Obligation.status == "Delayed").scalar() or 0
    o_overdue = db.query(func.count(Obligation.obligation_id)).filter(
        or_(
            Obligation.status == "Overdue",
            (Obligation.due_date < today) & (Obligation.status != "Completed")
        )
    ).scalar() or 0

    return ObligationAnalyticsSummary(
        total_obligations=o_total,
        pending_obligations=o_pending,
        in_progress_obligations=o_in_progress,
        completed_obligations=o_completed,
        delayed_obligations=o_delayed,
        overdue_obligations=o_overdue
    )


def get_renewal_summary(db: Session) -> RenewalAnalyticsSummary:
    today = date.today()
    r_upcoming = db.query(func.count(Renewal.id)).filter(
        or_(Renewal.status == "Upcoming", Renewal.status == "Pending")
    ).scalar() or 0
    r_in_progress = db.query(func.count(Renewal.id)).filter(
        or_(Renewal.status == "In Progress", Renewal.status == "Under Review")
    ).scalar() or 0
    r_renewed = db.query(func.count(Renewal.id)).filter(Renewal.status == "Renewed").scalar() or 0
    r_expired = db.query(func.count(Renewal.id)).filter(Renewal.status == "Expired").scalar() or 0
    r_cancelled = db.query(func.count(Renewal.id)).filter(
        or_(Renewal.status == "Cancelled", Renewal.status == "Canceled")
    ).scalar() or 0

    # Contracts approaching expiry within 60 days
    approaching = []
    contracts_with_end = db.query(Contract).filter(
        Contract.end_date.isnot(None),
        Contract.status.in_(["Active", "Approved", "Under Review"])
    ).order_by(Contract.end_date.asc()).all()

    for c in contracts_with_end:
        days_rem = (c.end_date - today).days
        if days_rem <= 90:  # Include contracts expiring soon
            approaching.append(
                ContractApproachingExpiry(
                    contract_id=c.id,
                    contract_number=c.contract_number,
                    title=c.title,
                    expiry_date=c.end_date,
                    days_remaining=days_rem
                )
            )

    return RenewalAnalyticsSummary(
        upcoming_renewals=r_upcoming,
        renewals_in_progress=r_in_progress,
        renewed_contracts=r_renewed,
        expired_renewals=r_expired,
        cancelled_renewals=r_cancelled,
        contracts_approaching_expiry=approaching
    )


def get_compliance_summary(db: Session) -> ComplianceAnalyticsSummary:
    records = db.query(ComplianceRecord).all()
    if not records:
        compliance_service.get_all_compliance_records(db)
        records = db.query(ComplianceRecord).all()

    total_eval = len(records)
    compliant = sum(1 for r in records if r.compliance_status == "Compliant")
    pending = sum(1 for r in records if r.compliance_status == "Pending")
    delayed = sum(1 for r in records if r.compliance_status == "Delayed")
    non_compliant = sum(1 for r in records if r.compliance_status in ["Non-Compliant", "Non Compliant"])
    high_risk = sum(1 for r in records if r.risk_level == "High")

    avg_score = (sum(r.compliance_score for r in records) / total_eval) if total_eval > 0 else 100.0

    return ComplianceAnalyticsSummary(
        total_contracts_evaluated=total_eval,
        compliant_contracts=compliant,
        pending_contracts=pending,
        delayed_contracts=delayed,
        non_compliant_contracts=non_compliant,
        high_risk_contracts=high_risk,
        average_compliance_score=round(avg_score, 1)
    )


def get_risk_summary(db: Session) -> List[RiskContractSummary]:
    contracts = db.query(Contract).all()
    result = []
    for c in contracts:
        rec = compliance_service.evaluate_contract_compliance(c.id, db)
        if rec.risk_level in ["High", "Medium"] or rec.overdue_obligations > 0 or rec.compliance_score < 80.0:
            result.append(
                RiskContractSummary(
                    contract_id=c.id,
                    contract_number=c.contract_number,
                    title=c.title,
                    risk_level=rec.risk_level,
                    overdue_obligations=rec.overdue_obligations,
                    compliance_score=round(rec.compliance_score, 1)
                )
            )
    return result


def get_department_summary(db: Session) -> DepartmentAnalyticsSummary:
    today = date.today()
    users = db.query(User).all()
    dept_map: Dict[str, Dict[str, int]] = {}

    for u in users:
        dept = u.department.strip() if u.department and u.department.strip() else "General"
        if dept not in dept_map:
            dept_map[dept] = {"contracts": 0, "obligations": 0, "overdue": 0}

    # Aggregate contracts by user created_by or assigned_to department
    contracts = db.query(Contract).all()
    for c in contracts:
        user = db.query(User).filter(User.user_id == (c.assigned_to or c.created_by)).first()
        dept = (user.department.strip() if user and user.department and user.department.strip() else "General")
        if dept not in dept_map:
            dept_map[dept] = {"contracts": 0, "obligations": 0, "overdue": 0}
        dept_map[dept]["contracts"] += 1

    # Aggregate obligations by assigned user department
    obligations = db.query(Obligation).all()
    for o in obligations:
        user = db.query(User).filter(User.user_id == o.responsible_user_id).first()
        dept = (user.department.strip() if user and user.department and user.department.strip() else "General")
        if dept not in dept_map:
            dept_map[dept] = {"contracts": 0, "obligations": 0, "overdue": 0}
        dept_map[dept]["obligations"] += 1
        if o.status == "Overdue" or (o.due_date and o.due_date < today and o.status != "Completed"):
            dept_map[dept]["overdue"] += 1

    items = [
        DepartmentSummaryItem(
            department=dept,
            contracts=vals["contracts"],
            obligations=vals["obligations"],
            overdue=vals["overdue"]
        )
        for dept, vals in dept_map.items()
    ]

    items.sort(key=lambda x: x.contracts, reverse=True)
    return DepartmentAnalyticsSummary(departments=items)


# ----------------------------------------------------------------------
# Detailed Report Record Generators
# ----------------------------------------------------------------------

def get_contract_report_items(db: Session) -> List[ContractReportItem]:
    contracts = db.query(Contract).order_by(Contract.id.asc()).all()
    items = []
    for c in contracts:
        assignee = db.query(User).filter(User.user_id == c.assigned_to).first() if c.assigned_to else None
        creator = db.query(User).filter(User.user_id == c.created_by).first() if c.created_by else None
        assigned_user = assignee.name if assignee else (creator.name if creator else "Unassigned")

        items.append(
            ContractReportItem(
                contract_number=c.contract_number,
                title=c.title,
                category=c.category,
                status=c.status,
                start_date=c.start_date,
                end_date=c.end_date,
                assigned_user=assigned_user
            )
        )
    return items


def get_obligation_report_items(db: Session) -> List[ObligationReportItem]:
    obligations = db.query(Obligation).order_by(Obligation.obligation_id.asc()).all()
    items = []
    for o in obligations:
        contract = db.query(Contract).filter(Contract.id == o.contract_id).first()
        assignee = db.query(User).filter(User.user_id == o.responsible_user_id).first() if o.responsible_user_id else None

        items.append(
            ObligationReportItem(
                contract_number=contract.contract_number if contract else f"CNT-{o.contract_id}",
                obligation_title=o.title,
                obligation_type=o.obligation_type,
                assigned_user=assignee.name if assignee else "Unassigned",
                due_date=o.due_date,
                status=o.status,
                completion_date=o.completion_date
            )
        )
    return items


def get_renewal_report_items(db: Session) -> List[RenewalReportItem]:
    renewals = db.query(Renewal).order_by(Renewal.id.asc()).all()
    items = []
    for r in renewals:
        contract = db.query(Contract).filter(Contract.id == r.contract_id).first()
        assignee = db.query(User).filter(User.user_id == r.assigned_to).first() if r.assigned_to else None

        items.append(
            RenewalReportItem(
                contract_number=contract.contract_number if contract else f"CNT-{r.contract_id}",
                previous_expiry_date=r.previous_expiry_date,
                renewal_date=r.renewal_date,
                new_expiry_date=r.new_expiry_date,
                renewal_status=r.status,
                assigned_user=assignee.name if assignee else "Unassigned"
            )
        )
    return items


def get_compliance_report_items(db: Session) -> List[ComplianceReportItem]:
    records = db.query(ComplianceRecord).order_by(ComplianceRecord.id.asc()).all()
    items = []
    for r in records:
        contract = db.query(Contract).filter(Contract.id == r.contract_id).first()

        items.append(
            ComplianceReportItem(
                contract_number=contract.contract_number if contract else f"CNT-{r.contract_id}",
                compliance_status=r.compliance_status,
                compliance_score=round(r.compliance_score, 1),
                overdue_obligations=r.overdue_obligations,
                risk_level=r.risk_level,
                evaluation_date=r.evaluated_at
            )
        )
    return items


# ----------------------------------------------------------------------
# PDF Export Generation (ReportLab)
# ----------------------------------------------------------------------

def generate_pdf_bytes(title: str, headers: List[str], data_rows: List[List[str]], summary_lines: List[str] = None) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()

    # Custom typography styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=colors.HexColor('#1E293B')
    )
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#64748B')
    )
    summary_style = ParagraphStyle(
        'SummaryText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#334155')
    )
    cell_style = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=10,
        textColor=colors.HexColor('#0F172A')
    )
    header_cell_style = ParagraphStyle(
        'HeaderCell',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=11,
        textColor=colors.white
    )

    story = []

    # Title Banner
    story.append(Paragraph(f"ContractIQ — {title}", title_style))
    story.append(Spacer(1, 4))
    story.append(Paragraph(f"Generated on: {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')} | Confidentially Prepared", subtitle_style))
    story.append(Spacer(1, 10))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#2563EB'), spaceAfter=12))

    # Summary section if provided
    if summary_info := summary_lines:
        for line in summary_info:
            story.append(Paragraph(f"• {line}", summary_style))
        story.append(Spacer(1, 12))

    # Table formatting
    table_data = [[Paragraph(h, header_cell_style) for h in headers]]
    for row in data_rows:
        table_data.append([Paragraph(str(val if val is not None else "-"), cell_style) for val in row])

    # Dynamic Column Width calculation
    col_count = len(headers)
    page_width = 540  # 612 letter width - 72 margins
    col_width = page_width / col_count

    t = Table(table_data, colWidths=[col_width] * col_count)
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1E3A8A')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F8FAFC')]),
    ]))

    story.append(t)
    doc.build(story)
    buffer.seek(0)
    return buffer.getvalue()


# ----------------------------------------------------------------------
# Excel Export Generation (OpenPyXL)
# ----------------------------------------------------------------------

def generate_excel_bytes(title: str, headers: List[str], data_rows: List[List[str]], summary_lines: List[str] = None) -> bytes:
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = title[:31]  # Excel sheet title max 31 chars

    # Styling definitions
    title_font = Font(name="Calibri", size=16, bold=True, color="1E293B")
    subtitle_font = Font(name="Calibri", size=10, italic=True, color="64748B")
    summary_font = Font(name="Calibri", size=11, bold=True, color="1E3A8A")
    header_font = Font(name="Calibri", size=11, bold=True, color="FFFFFF")
    header_fill = PatternFill(start_color="1E3A8A", end_color="1E3A8A", fill_type="solid")
    data_font = Font(name="Calibri", size=10, color="0F172A")
    alt_fill = PatternFill(start_color="F8FAFC", end_color="F8FAFC", fill_type="solid")
    thin_border = Border(
        left=Side(style='thin', color='E2E8F0'),
        right=Side(style='thin', color='E2E8F0'),
        top=Side(style='thin', color='E2E8F0'),
        bottom=Side(style='thin', color='E2E8F0')
    )

    current_row = 1

    # Title Block
    ws.cell(row=current_row, column=1, value=f"ContractIQ — {title}").font = title_font
    current_row += 1
    ws.cell(row=current_row, column=1, value=f"Generated: {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}").font = subtitle_font
    current_row += 2

    # Summary block if provided
    if summary_lines:
        for line in summary_lines:
            ws.cell(row=current_row, column=1, value=f"• {line}").font = summary_font
            current_row += 1
        current_row += 1

    # Table Headers
    header_row_idx = current_row
    for col_idx, header in enumerate(headers, start=1):
        cell = ws.cell(row=header_row_idx, column=col_idx, value=header)
        cell.font = header_font
        cell.fill = header_fill
        cell.alignment = Alignment(horizontal="center", vertical="center")
        cell.border = thin_border
    current_row += 1

    # Table Data
    for r_idx, row in enumerate(data_rows):
        fill = alt_fill if r_idx % 2 == 1 else PatternFill(fill_type=None)
        for c_idx, val in enumerate(row, start=1):
            cell = ws.cell(row=current_row, column=c_idx, value=str(val) if val is not None else "")
            cell.font = data_font
            cell.border = thin_border
            if fill.fill_type:
                cell.fill = fill
            cell.alignment = Alignment(horizontal="left", vertical="center")
        current_row += 1

    # Auto-adjust column widths
    for col in ws.columns:
        max_len = 0
        col_letter = get_column_letter(col[0].column)
        for cell in col:
            if cell.row >= header_row_idx and cell.value:
                max_len = max(max_len, len(str(cell.value)))
        ws.column_dimensions[col_letter].width = max(max_len + 4, 12)

    buffer = io.BytesIO()
    wb.save(buffer)
    buffer.seek(0)
    return buffer.getvalue()
