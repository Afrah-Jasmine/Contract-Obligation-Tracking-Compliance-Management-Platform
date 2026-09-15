export interface ContractStatusCount {
  status: string;
  count: number;
}

export interface ContractSummaryResponse {
  total_contracts: number;
  active_contracts: number;
  expired_contracts: number;
  pending_approval: number;
  contracts_by_status: ContractStatusCount[];
}

export interface ObligationStatusCount {
  status: string;
  count: number;
}

export interface ObligationSummaryResponse {
  total_obligations: number;
  pending_obligations: number;
  completed_obligations: number;
  overdue_obligations: number;
  obligations_by_status: ObligationStatusCount[];
}

export interface RenewalItem {
  renewal_id: number;
  contract_id: number;
  renewal_date: string;
  contract_end_date: string;
  status: string;
}

export interface RenewalSummaryResponse {
  upcoming_renewals: number;
  expired_contracts: number;
  immediate_attention: number;
  renewals: RenewalItem[];
}

export interface ComplianceReportSummaryResponse {
  total_contracts: number;
  compliant_contracts: number;
  partially_compliant_contracts: number;
  non_compliant_contracts: number;
  high_risk_contracts: number;
  high_risk_obligations: number;
  overall_compliance_percentage: number;
}

export interface DashboardResponse {
  contracts: ContractSummaryResponse;
  obligations: ObligationSummaryResponse;
  renewals: RenewalSummaryResponse;
  compliance: ComplianceReportSummaryResponse;
}
