import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api';
import { ComplianceResponse, ComplianceSummary } from '../models/compliance.model';

@Injectable({
  providedIn: 'root'
})
export class ComplianceService {

  constructor(private api: ApiService) {}

  getAllCompliance(): Observable<ComplianceResponse[]> {
    return this.api.get<ComplianceResponse[]>('/compliance');
  }

  getContractCompliance(contractId: number): Observable<ComplianceResponse> {
    return this.api.get<ComplianceResponse>(`/compliance/contracts/${contractId}`);
  }

  getNonCompliantContracts(): Observable<ComplianceResponse[]> {
    return this.api.get<ComplianceResponse[]>('/compliance/non-compliant');
  }

  getHighRiskContracts(): Observable<ComplianceResponse[]> {
    return this.api.get<ComplianceResponse[]>('/compliance/high-risk');
  }

  getComplianceSummary(): Observable<ComplianceSummary> {
    return this.api.get<ComplianceSummary>('/compliance/summary');
  }
}
