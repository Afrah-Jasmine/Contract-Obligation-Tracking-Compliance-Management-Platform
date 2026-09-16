import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class RenewalsService {

  private apiUrl = 'http://127.0.0.1:8000/renewals';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {

    const token =
      localStorage.getItem('access_token');

    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

  }


  // ===============================
  // GET ALL RENEWALS
  // ===============================

  getRenewals() {

    return this.http.get<any[]>(
      `${this.apiUrl}/`,
      {
        headers: this.getHeaders()
      }
    );

  }


  // ===============================
  // CREATE RENEWAL
  // ===============================

  createRenewal(renewal: any) {

    return this.http.post<any>(
      `${this.apiUrl}/`,
      renewal,
      {
        headers: this.getHeaders()
      }
    );

  }


  // ===============================
  // UPDATE RENEWAL
  // ===============================

  updateRenewal(
    renewalId: number,
    renewal: any
  ) {

    return this.http.put<any>(
      `${this.apiUrl}/${renewalId}`,
      renewal,
      {
        headers: this.getHeaders()
      }
    );

  }


  // ===============================
  // UPDATE RENEWAL STATUS
  // ===============================

  updateRenewalStatus(
    renewalId: number,
    status: string
  ) {

    return this.http.patch<any>(
      `${this.apiUrl}/${renewalId}/status`,
      { status },
      {
        headers: this.getHeaders()
      }
    );

  }


  // ===============================
  // DELETE RENEWAL
  // ===============================

  deleteRenewal(renewalId: number) {

    return this.http.delete(
      `${this.apiUrl}/${renewalId}`,
      {
        headers: this.getHeaders()
      }
    );

  }

}