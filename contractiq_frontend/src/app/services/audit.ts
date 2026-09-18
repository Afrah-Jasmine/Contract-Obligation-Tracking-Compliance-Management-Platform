import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AuditLog {
  id: number;
  user_id: number;
  contract_id: number | null;
  action: string;
  entity_name: string;
  entity_id: number;
  before_data: string | null;
  after_data: string | null;
  ip_address: string | null;
  created_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuditService {

  private readonly baseUrl = 'http://127.0.0.1:8080/audit';

  constructor(private http: HttpClient) {}

  getAuditLogs(): Observable<AuditLog[]> {
    return this.http.get<AuditLog[]>(`${this.baseUrl}/`);
  }

  getAuditLog(auditId: number): Observable<AuditLog> {
    return this.http.get<AuditLog>(`${this.baseUrl}/${auditId}`);
  }
}