import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ObligationModel {
  obligation_id?: number;
  id?: number;
  contract_id: number;
  title: string;
  description?: string;
  obligation_type: string;
  due_date?: string;
  responsible_user_id?: number;
  assigned_to?: number;
  status: string;
  completion_date?: string;
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ObligationService {
  private apiUrl = `${environment.apiUrl}/obligations`;

  constructor(private http: HttpClient) {}

  getObligations(): Observable<ObligationModel[]> {
    return this.http.get<ObligationModel[]>(this.apiUrl);
  }

  getObligationById(id: number): Observable<ObligationModel> {
    return this.http.get<ObligationModel>(`${this.apiUrl}/${id}`);
  }

  createObligation(obligation: Partial<ObligationModel>): Observable<ObligationModel> {
    return this.http.post<ObligationModel>(this.apiUrl, obligation);
  }

  updateObligation(id: number, obligation: Partial<ObligationModel>): Observable<ObligationModel> {
    return this.http.put<ObligationModel>(`${this.apiUrl}/${id}`, obligation);
  }

  deleteObligation(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  updateStatus(id: number, status: string): Observable<ObligationModel> {
    return this.http.patch<ObligationModel>(`${this.apiUrl}/${id}/status`, { status });
  }
}
