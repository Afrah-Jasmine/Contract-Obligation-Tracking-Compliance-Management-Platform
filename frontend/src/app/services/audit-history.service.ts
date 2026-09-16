import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuditHistoryService {

  private apiUrl = 'http://127.0.0.1:8000';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {

    const token = localStorage.getItem('access_token');

    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getAuditLogs() {

    return this.http.get<any[]>(
      `${this.apiUrl}/audit-logs/`,
      {
        headers: this.getHeaders()
      }
    );

  }
}