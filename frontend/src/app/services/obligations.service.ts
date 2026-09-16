import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ObligationsService {

  private apiUrl = 'http://127.0.0.1:8000/obligations';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {

    const token = localStorage.getItem('access_token');

    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

  }

  // ===============================
  // GET ALL OBLIGATIONS
  // ===============================

  getObligations() {

    return this.http.get<any[]>(
      `${this.apiUrl}/`,
      {
        headers: this.getHeaders()
      }
    );

  }

  // ===============================
  // CREATE OBLIGATION
  // ===============================

  createObligation(obligation: any) {

    return this.http.post<any>(
      `${this.apiUrl}/`,
      obligation,
      {
        headers: this.getHeaders()
      }
    );

  }

  // ===============================
  // GET OBLIGATIONS BY CONTRACT
  // ===============================

  getObligationsByContract(contractId: number) {

    return this.http.get<any[]>(
      `${this.apiUrl}/contract/${contractId}`,
      {
        headers: this.getHeaders()
      }
    );

  }

  // ===============================
  // UPDATE OBLIGATION
  // ===============================

  updateObligation(
    obligationId: number,
    obligation: any
  ) {

    return this.http.put<any>(
      `${this.apiUrl}/${obligationId}`,
      obligation,
      {
        headers: this.getHeaders()
      }
    );

  }

  // ===============================
  // UPDATE OBLIGATION STATUS
  // ===============================

  updateObligationStatus(
    obligationId: number,
    status: string
  ) {

    return this.http.patch<any>(
      `${this.apiUrl}/${obligationId}/status`,
      { status },
      {
        headers: this.getHeaders()
      }
    );

  }



  // ===============================
  // DELETE OBLIGATION
  // ===============================

  deleteObligation(obligationId: number) {

    return this.http.delete(
      `${this.apiUrl}/${obligationId}`,
      {
        headers: this.getHeaders()
      }
    );

  }

}