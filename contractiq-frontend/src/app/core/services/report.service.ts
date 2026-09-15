import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api';
import {
  DashboardResponse,
  ContractSummaryResponse,
  ObligationSummaryResponse,
  RenewalSummaryResponse,
  ComplianceReportSummaryResponse
} from '../models/report.model';

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  constructor(private api: ApiService) {}

  getDashboardSummary(): Observable<DashboardResponse> {
    return this.api.get<DashboardResponse>('/reports/dashboard');
  }

  getContractSummary(status?: string): Observable<ContractSummaryResponse> {
    const query = status ? `?contract_status=${encodeURIComponent(status)}` : '';
    return this.api.get<ContractSummaryResponse>(`/reports/contracts${query}`);
  }

  getObligationSummary(obligationStatus?: string, contractStatus?: string): Observable<ObligationSummaryResponse> {
    const params: string[] = [];
    if (obligationStatus) params.push(`obligation_status=${encodeURIComponent(obligationStatus)}`);
    if (contractStatus) params.push(`contract_status=${encodeURIComponent(contractStatus)}`);
    const query = params.length > 0 ? `?${params.join('&')}` : '';
    return this.api.get<ObligationSummaryResponse>(`/reports/obligations${query}`);
  }

  getRenewalSummary(days: number = 90, startDate?: string, endDate?: string): Observable<RenewalSummaryResponse> {
    const params: string[] = [`days=${days}`];
    if (startDate) params.push(`start_date=${encodeURIComponent(startDate)}`);
    if (endDate) params.push(`end_date=${encodeURIComponent(endDate)}`);
    return this.api.get<RenewalSummaryResponse>(`/reports/renewals?${params.join('&')}`);
  }

  getComplianceSummary(contractStatus?: string): Observable<ComplianceReportSummaryResponse> {
    const query = contractStatus ? `?contract_status=${encodeURIComponent(contractStatus)}` : '';
    return this.api.get<ComplianceReportSummaryResponse>(`/reports/compliance${query}`);
  }
}
