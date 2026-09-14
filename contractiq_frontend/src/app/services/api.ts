import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private readonly baseUrl = 'http://localhost:8080';

  constructor(private http: HttpClient) {}

  getDashboardSummary(): Observable<any> {
    return this.http.get<any>(
      `${this.baseUrl}/dashboard/summary`
    );
  }

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
}