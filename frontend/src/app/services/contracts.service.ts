import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ContractsService {

  private apiUrl = 'http://127.0.0.1:8000/contracts';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');

    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // GET ALL CONTRACTS
  getContracts() {
    return this.http.get<any[]>(
      `${this.apiUrl}/`,
      {
        headers: this.getHeaders()
      }
    );
  }

  // CREATE CONTRACT
  createContract(contract: any) {
    return this.http.post<any>(
      `${this.apiUrl}/`,
      contract,
      {
        headers: this.getHeaders()
      }
    );
  }

  // UPDATE CONTRACT
  updateContract(contractId: number, contract: any) {
    return this.http.put<any>(
      `${this.apiUrl}/${contractId}`,
      contract,
      {
        headers: this.getHeaders()
      }
    );
  }

  // UPDATE STATUS
  updateContractStatus(contractId: number, status: string) {
    return this.http.patch<any>(
      `${this.apiUrl}/${contractId}/status`,
      { status },
      {
        headers: this.getHeaders()
      }
    );
  }

  // SUBMIT FOR REVIEW
  submitForReview(contractId: number) {
    return this.http.post<any>(
      `${this.apiUrl}/${contractId}/submit-review`,
      {},
      {
        headers: this.getHeaders()
      }
    );
  }

  // APPROVE CONTRACT
  approveContract(contractId: number) {
    return this.http.post<any>(
      `${this.apiUrl}/${contractId}/approve`,
      {},
      {
        headers: this.getHeaders()
      }
    );
  }

  // ASSIGN CONTRACT
  assignContract(contractId: number, assignedTo: number) {
    return this.http.patch<any>(
      `${this.apiUrl}/${contractId}/assign`,
      { assigned_to: assignedTo },
      {
        headers: this.getHeaders()
      }
    );
  }
  // DELETE CONTRACT
deleteContract(contractId: number) {
  return this.http.delete(
    `${this.apiUrl}/${contractId}`,
    {
      headers: this.getHeaders()
    }
  );
}
}