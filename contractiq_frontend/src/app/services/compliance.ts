import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ComplianceRecord {
  contract_id: number;
  contract_number: string;
  compliance_status: string;
  compliance_score: number;
}

@Injectable({
  providedIn: 'root'
})
export class ComplianceService {

  private readonly baseUrl = 'http://127.0.0.1:8080/compliance';

  constructor(private http: HttpClient) {}

  getCompliance(): Observable<ComplianceRecord[]> {
    return this.http.get<ComplianceRecord[]>(`${this.baseUrl}/`);
  }

  getComplianceById(complianceId: number): Observable<ComplianceRecord> {
    return this.http.get<ComplianceRecord>(
      `${this.baseUrl}/${complianceId}`
    );
  }
}