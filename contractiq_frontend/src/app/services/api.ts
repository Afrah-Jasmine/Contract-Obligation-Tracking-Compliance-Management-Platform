import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private baseUrl = 'http://localhost:8000';

  constructor(private http: HttpClient) {}

  // =========================
  // AUTHENTICATION
  // =========================

  login(email: string, password: string) {
    const body = new URLSearchParams();
    body.set('username', email);
    body.set('password', password);

    return this.http.post<{ access_token: string; token_type: string }>(
      `${this.baseUrl}/login`,
      body.toString(),
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/x-www-form-urlencoded'
        })
      }
    );
  }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');

    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  // =========================
  // USERS
  // =========================

  getUsers() {
    return this.http.get(
      `${this.baseUrl}/db/users`,
      { headers: this.getAuthHeaders() }
    );
  }

  // =========================
  // DASHBOARD
  // =========================

  getDashboardSummary() {
    return this.http.get(
      `${this.baseUrl}/dashboard/summary`,
      { headers: this.getAuthHeaders() }
    );
  }

  // =========================
  // CONTRACTS
  // =========================

  getContracts() {
    return this.http.get(
      `${this.baseUrl}/contracts`,
      { headers: this.getAuthHeaders() }
    );
  }

  getContract(id: number) {
    return this.http.get(
      `${this.baseUrl}/contracts/${id}`,
      { headers: this.getAuthHeaders() }
    );
  }

  createContract(contract: any) {
    return this.http.post(
      `${this.baseUrl}/contracts`,
      contract,
      { headers: this.getAuthHeaders() }
    );
  }

  updateContract(id: number, contract: any) {
    return this.http.put(
      `${this.baseUrl}/contracts/${id}`,
      contract,
      { headers: this.getAuthHeaders() }
    );
  }

  submitForReview(id: number) {
    return this.http.post(
      `${this.baseUrl}/contracts/${id}/submit-review`,
      {},
      { headers: this.getAuthHeaders() }
    );
  }

  approveContract(id: number) {
    return this.http.post(
      `${this.baseUrl}/contracts/${id}/approve`,
      {},
      { headers: this.getAuthHeaders() }
    );
  }

  activateContract(id: number) {
    return this.http.post(
      `${this.baseUrl}/contracts/${id}/activate`,
      {},
      { headers: this.getAuthHeaders() }
    );
  }

  updateContractStatus(id: number, status: string) {
    return this.http.patch(
      `${this.baseUrl}/contracts/${id}/status`,
      { status },
      { headers: this.getAuthHeaders() }
    );
  }

  getObligations() {
  return this.http.get(
    `${this.baseUrl}/obligations`,
    { headers: this.getAuthHeaders() }
  );
  }
  
  getRenewals() {
  return this.http.get(
    `${this.baseUrl}/renewals`,
    { headers: this.getAuthHeaders() }
  );
  }
}
