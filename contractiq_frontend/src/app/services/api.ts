import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

private readonly baseUrl = 'https://contract-obligation-tracking-compliance-zagb.onrender.com';
  constructor(private http: HttpClient) {}

  // ============================================================
  // DASHBOARD
  // ============================================================

  getDashboardSummary(): Observable<any> {
    return this.http.get<any>(
      `${this.baseUrl}/dashboard/summary`
    );
  }


  // ============================================================
  // REPORT SUMMARIES
  // ============================================================

  getContractStatistics(): Observable<any> {
    return this.http.get<any>(
      `${this.baseUrl}/reports/contracts/summary`
    );
  }

  getObligationStatistics(): Observable<any> {
    return this.http.get<any>(
      `${this.baseUrl}/reports/obligations/summary`
    );
  }

  getRenewalStatistics(): Observable<any> {
    return this.http.get<any>(
      `${this.baseUrl}/reports/renewals/summary`
    );
  }

  getComplianceStatistics(): Observable<any> {
    return this.http.get<any>(
      `${this.baseUrl}/reports/compliance/summary`
    );
  }

  getRiskSummary(): Observable<any> {
    return this.http.get<any>(
      `${this.baseUrl}/reports/risk`
    );
  }

  getUpcomingRenewals(): Observable<any> {
    return this.http.get<any>(
      `${this.baseUrl}/reports/renewals/upcoming`
    );
  }

  getOverdueObligations(): Observable<any> {
    return this.http.get<any>(
      `${this.baseUrl}/reports/obligations/overdue`
    );
  }

  getDepartmentPerformance(): Observable<any> {
    return this.http.get<any>(
      `${this.baseUrl}/reports/department-performance`
    );
  }


  // ============================================================
  // REPORT EXPORTS
  // IMPORTANT:
  // These use HttpClient so the JWT interceptor adds
  // Authorization: Bearer <token>
  // ============================================================

  exportContractsPdf(): Observable<Blob> {
    return this.http.get(
      `${this.baseUrl}/reports/contracts/export/pdf`,
      {
        responseType: 'blob'
      }
    );
  }

  exportContractsExcel(): Observable<Blob> {
    return this.http.get(
      `${this.baseUrl}/reports/contracts/export/excel`,
      {
        responseType: 'blob'
      }
    );
  }

  exportObligationsPdf(): Observable<Blob> {
    return this.http.get(
      `${this.baseUrl}/reports/obligations/export/pdf`,
      {
        responseType: 'blob'
      }
    );
  }

  exportObligationsExcel(): Observable<Blob> {
    return this.http.get(
      `${this.baseUrl}/reports/obligations/export/excel`,
      {
        responseType: 'blob'
      }
    );
  }

  exportRenewalsPdf(): Observable<Blob> {
    return this.http.get(
      `${this.baseUrl}/reports/renewals/export/pdf`,
      {
        responseType: 'blob'
      }
    );
  }

  exportRenewalsExcel(): Observable<Blob> {
    return this.http.get(
      `${this.baseUrl}/reports/renewals/export/excel`,
      {
        responseType: 'blob'
      }
    );
  }

  exportCompliancePdf(): Observable<Blob> {
    return this.http.get(
      `${this.baseUrl}/reports/compliance/export/pdf`,
      {
        responseType: 'blob'
      }
    );
  }

  exportComplianceExcel(): Observable<Blob> {
    return this.http.get(
      `${this.baseUrl}/reports/compliance/export/excel`,
      {
        responseType: 'blob'
      }
    );
  }
}