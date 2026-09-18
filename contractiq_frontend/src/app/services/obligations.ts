import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Obligation {
  id: number;
  contract_id: number;
  title: string;
  description: string | null;
  obligation_type: string;
  due_date: string;
  assigned_to: number | null;
  status: string;
  completion_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateObligationRequest {
  contract_id: number;
  title: string;
  description: string;
  obligation_type: string;
  due_date: string;
  assigned_to: number;
  status: string;
  completion_date?: string | null;
}

export interface UpdateObligationRequest {
  title: string;
  description: string;
  obligation_type: string;
  due_date: string;
  assigned_to: number;
  status: string;
  completion_date?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class ObligationsService {

  private readonly baseUrl =
    'http://127.0.0.1:8080/obligations';

  constructor(private http: HttpClient) {}

  getObligations(): Observable<Obligation[]> {
    return this.http.get<Obligation[]>(
      `${this.baseUrl}/`
    );
  }

  getObligation(
    obligationId: number
  ): Observable<Obligation> {
    return this.http.get<Obligation>(
      `${this.baseUrl}/${obligationId}`
    );
  }

  createObligation(
    data: CreateObligationRequest
  ): Observable<Obligation> {
    return this.http.post<Obligation>(
      `${this.baseUrl}/`,
      data
    );
  }

  updateObligation(
    obligationId: number,
    data: UpdateObligationRequest
  ): Observable<Obligation> {
    return this.http.put<Obligation>(
      `${this.baseUrl}/${obligationId}`,
      data
    );
  }
}