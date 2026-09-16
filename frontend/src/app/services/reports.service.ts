import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ReportsService {

  private apiUrl = 'http://127.0.0.1:8000/reports';

  constructor(private http: HttpClient) {}

  private headers(): HttpHeaders {

  const token = localStorage.getItem('access_token');

  console.log('REPORT TOKEN:', token);

  return new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  });
}

  getContractSummary() {
    return this.http.get<any>(
      `${this.apiUrl}/contracts/summary`,
      { headers: this.headers() }
    );
  }

  getObligationSummary() {
    return this.http.get<any>(
      `${this.apiUrl}/obligations/summary`,
      { headers: this.headers() }
    );
  }

  getRenewalSummary() {
    return this.http.get<any>(
      `${this.apiUrl}/renewals/summary`,
      { headers: this.headers() }
    );
  }

  getComplianceSummary() {
    return this.http.get<any>(
      `${this.apiUrl}/compliance/summary`,
      { headers: this.headers() }
    );
  }

  getRiskReport() {
    return this.http.get<any[]>(
      `${this.apiUrl}/risk`,
      { headers: this.headers() }
    );
  }

  getUpcomingExpiry(days: number = 30) {
    return this.http.get<any[]>(
      `${this.apiUrl}/contracts/upcoming-expiry?days=${days}`,
      { headers: this.headers() }
    );
  }

  getUpcomingRenewals() {
    return this.http.get<any[]>(
      `${this.apiUrl}/renewals/upcoming`,
      { headers: this.headers() }
    );
  }

  getOverdueObligations() {
    return this.http.get<any[]>(
      `${this.apiUrl}/obligations/overdue`,
      { headers: this.headers() }
    );
  }

  getDepartmentPerformance() {
    return this.http.get<any[]>(
      `${this.apiUrl}/departments/performance`,
      { headers: this.headers() }
    );
  }

  getImmediateAttention(days: number = 15) {
    return this.http.get<any[]>(
      `${this.apiUrl}/renewals/immediate-attention?days=${days}`,
      { headers: this.headers() }
    );
  }

  getContractsByStatus(status: string = '') {
    let url = `${this.apiUrl}/contracts/filter`;

    if (status) {
      url += `?status=${encodeURIComponent(status)}`;
    }

    return this.http.get<any[]>(url, {
      headers: this.headers()
    });
  }

  getObligationsByStatus(status: string = '') {
    let url = `${this.apiUrl}/obligations/filter`;

    if (status) {
      url += `?status=${encodeURIComponent(status)}`;
    }

    return this.http.get<any[]>(url, {
      headers: this.headers()
    });
  }

  getRenewalsByDateRange(
    startDate: string,
    endDate: string
  ) {
    return this.http.get<any[]>(
      `${this.apiUrl}/renewals/date-range?start_date=${startDate}&end_date=${endDate}`,
      { headers: this.headers() }
    );
  }

  downloadReport(
    type: string,
    format: 'pdf' | 'excel'
  ) {
    return this.http.get(
      `${this.apiUrl}/${type}/export/${format}`,
      {
        headers: this.headers(),
        responseType: 'blob'
      }
    );
  }
}