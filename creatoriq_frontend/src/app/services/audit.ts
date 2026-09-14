import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AuditLog {
  id: number;
  user_id: number;
  user_name: string | null;
  action: string;
  entity_type: string;
  details: string | null;
  created_at: string;
}

export interface Activity {
  id: number;
  user_id: number;
  user_name: string | null;
  activity_type: string;
  description: string;
  created_at: string;
}

export interface AuditActivityHistory {
  audit_logs: AuditLog[];
  activities: Activity[];
}

@Injectable({
  providedIn: 'root'
})
export class Audit {
  private readonly baseUrl = 'http://127.0.0.1:8000/audit';

  constructor(private http: HttpClient) {}

  getAuditLogs(): Observable<AuditLog[]> {
    return this.http.get<AuditLog[]>(
      `${this.baseUrl}/logs`
    );
  }

  getActivities(): Observable<Activity[]> {
    return this.http.get<Activity[]>(
      `${this.baseUrl}/activities`
    );
  }

  getAuditActivityHistory(): Observable<AuditActivityHistory> {
    return this.http.get<AuditActivityHistory>(
      this.baseUrl
    );
  }
}