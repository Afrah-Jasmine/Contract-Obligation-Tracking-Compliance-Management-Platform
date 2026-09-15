import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';


// =====================================================
// BACKEND RESPONSE
// =====================================================

interface BackendComplianceSummary {
  total_contracts: number;
  compliant: number;
  pending: number;
  delayed: number;
  non_compliant: number;
  high_risk: number;
  average_score: number;
}


// =====================================================
// FRONTEND SUMMARY
// =====================================================

export interface ComplianceSummary {
  total: number;
  compliant: number;
  pending: number;
  delayed: number;
  non_compliant: number;
  high_risk: number;
  average_score: number;
}


// =====================================================
// ALL COMPLIANCE RESPONSE
// =====================================================

export interface ComplianceRecord {
  contract_id: number;
  contract_number: string;
  compliance_status: string;
  compliance_score: number;
}


// =====================================================
// RISK RESPONSE
// =====================================================

export interface ComplianceRisk {
  contract_id: number;
  contract_number: string;
  risk_level: string;
  overdue_obligations: number;
  compliance_score: number;
}


// =====================================================
// SERVICE
// =====================================================

@Injectable({
  providedIn: 'root'
})
export class ComplianceService {

  private apiUrl = 'http://127.0.0.1:8000';


  constructor(
    private http: HttpClient
  ) {}


  // ===================================================
  // GET COMPLIANCE SUMMARY
  // ===================================================

  getComplianceSummary(): Observable<ComplianceSummary> {

    return this.http
      .get<BackendComplianceSummary>(
        `${this.apiUrl}/reports/compliance/summary`
      )
      .pipe(

        map((data) => ({

          total:
            data.total_contracts,

          compliant:
            data.compliant,

          pending:
            data.pending,

          delayed:
            data.delayed,

          non_compliant:
            data.non_compliant,

          high_risk:
            data.high_risk,

          average_score:
            data.average_score

        }))

      );

  }


  // ===================================================
  // GET ALL COMPLIANCE
  // ===================================================

  getAllCompliance():
    Observable<ComplianceRecord[]> {

    return this.http.get<ComplianceRecord[]>(
      `${this.apiUrl}/compliance`
    );

  }


  // ===================================================
  // GET HIGH RISK CONTRACTS
  // ===================================================

  getRiskReport():
    Observable<ComplianceRisk[]> {

    return this.http.get<ComplianceRisk[]>(
      `${this.apiUrl}/compliance/high-risk`
    );

  }

}