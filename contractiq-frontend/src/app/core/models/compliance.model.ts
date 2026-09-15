export type ComplianceStatus = 'Compliant' | 'Partially Compliant' | 'Non-Compliant';
export type RiskLevel = 'Low' | 'Medium' | 'High';

export interface ComplianceResponse {
  contract_id: number;
  total_obligations: number;
  completed_obligations: number;
  pending_obligations: number;
  overdue_obligations: number;
  compliance_percentage: number;
  compliance_status: ComplianceStatus;
  risk_level: RiskLevel;
}

export interface ComplianceSummary {
  total_contracts: number;
  compliant_contracts: number;
  partially_compliant_contracts: number;
  non_compliant_contracts: number;
  high_risk_contracts: number;
}
