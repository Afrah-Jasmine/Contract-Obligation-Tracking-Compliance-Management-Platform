import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AuditLogItem {
  id: number;
  user_name: string;
  action: string;
  resource: string;
  details: string;
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuditService {
  private apiUrl = `${environment.apiUrl}/audit`;

  constructor(private http: HttpClient) {}

  getAuditLogs(): Observable<AuditLogItem[]> {
    return this.http.get<AuditLogItem[]>(this.apiUrl).pipe(
      // Fallback if backend audit endpoint is dynamic
      
    );
  }
}
