import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface RenewalModel {
  id?: number;
  renewal_id?: number;
  contract_id: number;
  renewal_date?: string;
  previous_expiry_date?: string;
  new_expiry_date?: string;
  status: string;
  assigned_to?: number;
  notes?: string;
  created_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class RenewalService {
  private apiUrl = `${environment.apiUrl}/renewals`;

  constructor(private http: HttpClient) {}

  getRenewals(): Observable<RenewalModel[]> {
    return this.http.get<RenewalModel[]>(this.apiUrl);
  }

  getRenewalById(id: number): Observable<RenewalModel> {
    return this.http.get<RenewalModel>(`${this.apiUrl}/${id}`);
  }

  createRenewal(renewal: Partial<RenewalModel>): Observable<RenewalModel> {
    return this.http.post<RenewalModel>(this.apiUrl, renewal);
  }

  updateRenewal(id: number, renewal: Partial<RenewalModel>): Observable<RenewalModel> {
    return this.http.put<RenewalModel>(`${this.apiUrl}/${id}`, renewal);
  }

  updateStatus(id: number, status: string): Observable<RenewalModel> {
    return this.http.patch<RenewalModel>(`${this.apiUrl}/${id}/status`, { status });
  }

  deleteRenewal(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
