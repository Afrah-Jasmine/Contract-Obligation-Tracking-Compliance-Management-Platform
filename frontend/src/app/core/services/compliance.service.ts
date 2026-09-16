import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ComplianceRecordModel {
  id?: number;
  contract_id: number;
  contract_number?: string;
  title?: string;
  compliance_status: string;
  compliance_score: number;
  risk_level: string;
  total_obligations?: number;
  completed_obligations?: number;
  pending_obligations?: number;
  overdue_obligations?: number;
  delayed_obligations?: number;
  evaluated_at?: string;
  notes?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ComplianceService {
  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  getAllCompliance(): Observable<ComplianceRecordModel[]> {
    return this.http.get<ComplianceRecordModel[]>(`${this.apiUrl}/compliance`);
  }

  getContractCompliance(contractId: number): Observable<ComplianceRecordModel> {
    return this.http.get<ComplianceRecordModel>(`${this.apiUrl}/contracts/${contractId}/compliance`);
  }

  getContractComplianceHistory(contractId: number): Observable<ComplianceRecordModel[]> {
    return this.http.get<ComplianceRecordModel[]>(`${this.apiUrl}/contracts/${contractId}/compliance/history`);
  }

  getNonCompliantContracts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/compliance/non-compliant`);
  }

  getHighRiskContracts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/compliance/high-risk`);
  }
}
