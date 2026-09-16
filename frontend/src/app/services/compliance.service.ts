import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ComplianceService {

  private apiUrl = 'http://127.0.0.1:8000/compliance';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {

    const token = localStorage.getItem('access_token');

    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

  }


  // =====================================
  // GET ALL COMPLIANCE RECORDS
  // =====================================

  getCompliance() {

    return this.http.get<any[]>(
      `${this.apiUrl}`,
      {
        headers: this.getHeaders()
      }
    );

  }


  // =====================================
  // GET COMPLIANCE SUMMARY
  // =====================================

  getComplianceSummary() {

    return this.http.get<any>(
      `${this.apiUrl}/summary`,
      {
        headers: this.getHeaders()
      }
    );

  }


  // =====================================
  // GET NON-COMPLIANT CONTRACTS
  // =====================================

  getNonCompliant() {

    return this.http.get<any[]>(
      `${this.apiUrl}/non-compliant`,
      {
        headers: this.getHeaders()
      }
    );

  }


  // =====================================
  // GET HIGH-RISK CONTRACTS
  // =====================================

  getHighRisk() {

    return this.http.get<any[]>(
      `${this.apiUrl}/high-risk`,
      {
        headers: this.getHeaders()
      }
    );

  }


  // =====================================
  // GET CONTRACT COMPLIANCE
  // =====================================

  getContractCompliance(contractId: number) {

    return this.http.get<any>(
      `${this.apiUrl}/contracts/${contractId}/compliance`,
      {
        headers: this.getHeaders()
      }
    );

  }
  // =====================================
// GET COMPLIANCE HISTORY
// =====================================

getComplianceHistory(contractId: number) {

  return this.http.get<any[]>(
    `${this.apiUrl}/contracts/${contractId}/history`,
    {
      headers: this.getHeaders()
    }
  );

}


}