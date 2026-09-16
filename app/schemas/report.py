from datetime import date, datetime
from typing import Dict, List, Optional
from pydantic import BaseModel, Field


# ----------------------------------------------------------------------
# Dashboard Summary Schemas
# ----------------------------------------------------------------------

class DashboardContractSummary(BaseModel):
    total: int = 0
    active: int = 0
    draft: int = 0
    under_review: int = 0
    approved: int = 0
    expired: int = 0
    terminated: int = 0


class DashboardObligationSummary(BaseModel):
    total: int = 0
    pending: int = 0
    in_progress: int = 0
    completed: int = 0
    overdue: int = 0
    delayed: int = 0


class DashboardRenewalSummary(BaseModel):
    upcoming: int = 0
    in_progress: int = 0
    renewed: int = 0
    expired: int = 0
    cancelled: int = 0


class DashboardComplianceSummary(BaseModel):
    compliant: int = 0
    pending: int = 0
    delayed: int = 0
    non_compliant: int = 0
    high_risk: int = 0


class DashboardSummaryResponse(BaseModel):
    contracts: DashboardContractSummary
    obligations: DashboardObligationSummary
    renewals: DashboardRenewalSummary
    compliance: DashboardComplianceSummary


# ----------------------------------------------------------------------
# Contract Analytics Schemas
# ----------------------------------------------------------------------

class ContractAnalyticsSummary(BaseModel):
    total_contracts: int = 0
    active_contracts: int = 0
    draft_contracts: int = 0
    under_review_contracts: int = 0
    approved_contracts: int = 0
    expired_contracts: int = 0
    terminated_contracts: int = 0
    contracts_by_category: Dict[str, int] = Field(default_factory=dict)


# ----------------------------------------------------------------------
# Obligation Analytics Schemas
# ----------------------------------------------------------------------

class ObligationAnalyticsSummary(BaseModel):
    total_obligations: int = 0
    pending_obligations: int = 0
    in_progress_obligations: int = 0
    completed_obligations: int = 0
    delayed_obligations: int = 0
    overdue_obligations: int = 0


# ----------------------------------------------------------------------
# Renewal Analytics Schemas
# ----------------------------------------------------------------------

class ContractApproachingExpiry(BaseModel):
    contract_id: int
    contract_number: str
    title: str
    expiry_date: Optional[date] = None
    days_remaining: Optional[int] = None


class RenewalAnalyticsSummary(BaseModel):
    upcoming_renewals: int = 0
    renewals_in_progress: int = 0
    renewed_contracts: int = 0
    expired_renewals: int = 0
    cancelled_renewals: int = 0
    contracts_approaching_expiry: List[ContractApproachingExpiry] = Field(default_factory=list)


# ----------------------------------------------------------------------
# Compliance Analytics & Risk Analysis Schemas
# ----------------------------------------------------------------------

class ComplianceAnalyticsSummary(BaseModel):
    total_contracts_evaluated: int = 0
    compliant_contracts: int = 0
    pending_contracts: int = 0
    delayed_contracts: int = 0
    non_compliant_contracts: int = 0
    high_risk_contracts: int = 0
    average_compliance_score: float = 0.0


class RiskContractSummary(BaseModel):
    contract_id: int
    contract_number: str
    title: str
    risk_level: str
    overdue_obligations: int = 0
    compliance_score: float = 100.0


# ----------------------------------------------------------------------
# Department Performance Schemas
# ----------------------------------------------------------------------

class DepartmentSummaryItem(BaseModel):
    department: str
    contracts: int = 0
    obligations: int = 0
    overdue: int = 0


class DepartmentAnalyticsSummary(BaseModel):
    departments: List[DepartmentSummaryItem] = Field(default_factory=list)


# ----------------------------------------------------------------------
# Detailed Report Record Schemas
# ----------------------------------------------------------------------

class ContractReportItem(BaseModel):
    contract_number: str
    title: str
    category: str
    status: str
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    assigned_user: Optional[str] = "Unassigned"


class ObligationReportItem(BaseModel):
    contract_number: str
    obligation_title: str
    obligation_type: str
    assigned_user: Optional[str] = "Unassigned"
    due_date: Optional[date] = None
    status: str
    completion_date: Optional[date] = None


class RenewalReportItem(BaseModel):
    contract_number: str
    previous_expiry_date: Optional[date] = None
    renewal_date: Optional[date] = None
    new_expiry_date: Optional[date] = None
    renewal_status: str
    assigned_user: Optional[str] = "Unassigned"


class ComplianceReportItem(BaseModel):
    contract_number: str
    compliance_status: str
    compliance_score: float
    overdue_obligations: int
    risk_level: str
    evaluation_date: Optional[datetime] = None
