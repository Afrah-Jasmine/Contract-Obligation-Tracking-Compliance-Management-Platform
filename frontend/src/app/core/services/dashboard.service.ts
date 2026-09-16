import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ComplianceAnalyticsSummary,
  ContractAnalyticsSummary,
  DashboardSummaryResponse,
  DepartmentAnalyticsSummary,
  ObligationAnalyticsSummary,
  RenewalAnalyticsSummary,
  RiskContractSummary
} from '../models/dashboard.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getDashboardSummary(): Observable<DashboardSummaryResponse> {
    return this.http.get<DashboardSummaryResponse>(`${this.baseUrl}/dashboard/summary`);
  }

  getContractSummary(): Observable<ContractAnalyticsSummary> {
    return this.http.get<ContractAnalyticsSummary>(`${this.baseUrl}/reports/contracts/summary`);
  }

  getObligationSummary(): Observable<ObligationAnalyticsSummary> {
    return this.http.get<ObligationAnalyticsSummary>(`${this.baseUrl}/reports/obligations/summary`);
  }

  getRenewalSummary(): Observable<RenewalAnalyticsSummary> {
    return this.http.get<RenewalAnalyticsSummary>(`${this.baseUrl}/reports/renewals/summary`);
  }

  getComplianceSummary(): Observable<ComplianceAnalyticsSummary> {
    return this.http.get<ComplianceAnalyticsSummary>(`${this.baseUrl}/reports/compliance/summary`);
  }

  getRiskContracts(): Observable<RiskContractSummary[]> {
    return this.http.get<RiskContractSummary[]>(`${this.baseUrl}/reports/risk`);
  }

  getDepartmentSummary(): Observable<DepartmentAnalyticsSummary> {
    return this.http.get<DepartmentAnalyticsSummary>(`${this.baseUrl}/reports/departments/summary`);
  }

  downloadPdfReport(reportType: 'contracts' | 'obligations' | 'renewals' | 'compliance'): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/reports/${reportType}/export/pdf`, {
      responseType: 'blob'
    });
  }

  downloadExcelReport(reportType: 'contracts' | 'obligations' | 'renewals' | 'compliance'): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/reports/${reportType}/export/excel`, {
      responseType: 'blob'
    });
  }
}
