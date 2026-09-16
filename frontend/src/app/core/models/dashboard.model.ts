export interface DashboardContractSummary {
  total: number;
  active: number;
  draft: number;
  under_review: number;
  approved: number;
  expired: number;
  terminated: number;
}

export interface DashboardObligationSummary {
  total: number;
  pending: number;
  in_progress: number;
  completed: number;
  overdue: number;
  delayed: number;
}

export interface DashboardRenewalSummary {
  upcoming: number;
  in_progress: number;
  renewed: number;
  expired: number;
  cancelled: number;
}

export interface DashboardComplianceSummary {
  compliant: number;
  pending: number;
  delayed: number;
  non_compliant: number;
  high_risk: number;
}

export interface DashboardSummaryResponse {
  contracts: DashboardContractSummary;
  obligations: DashboardObligationSummary;
  renewals: DashboardRenewalSummary;
  compliance: DashboardComplianceSummary;
}

export interface ContractAnalyticsSummary {
  total_contracts: number;
  active_contracts: number;
  draft_contracts: number;
  under_review_contracts: number;
  approved_contracts: number;
  expired_contracts: number;
  terminated_contracts: number;
  contracts_by_category: { [key: string]: number };
}

export interface ObligationAnalyticsSummary {
  total_obligations: number;
  pending_obligations: number;
  in_progress_obligations: number;
  completed_obligations: number;
  delayed_obligations: number;
  overdue_obligations: number;
}

export interface ContractApproachingExpiry {
  contract_id: number;
  contract_number: string;
  title: string;
  expiry_date?: string;
  days_remaining?: number;
}

export interface RenewalAnalyticsSummary {
  upcoming_renewals: number;
  renewals_in_progress: number;
  renewed_contracts: number;
  expired_renewals: number;
  cancelled_renewals: number;
  contracts_approaching_expiry: ContractApproachingExpiry[];
}

export interface ComplianceAnalyticsSummary {
  total_contracts_evaluated: number;
  compliant_contracts: number;
  pending_contracts: number;
  delayed_contracts: number;
  non_compliant_contracts: number;
  high_risk_contracts: number;
  average_compliance_score: number;
}

export interface RiskContractSummary {
  contract_id: number;
  contract_number: string;
  title: string;
  risk_level: string;
  overdue_obligations: number;
  compliance_score: number;
}

export interface DepartmentSummaryItem {
  department: string;
  contracts: number;
  obligations: number;
  overdue: number;
}

export interface DepartmentAnalyticsSummary {
  departments: DepartmentSummaryItem[];
}
