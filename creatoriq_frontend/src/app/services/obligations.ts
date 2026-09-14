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
  assigned_to: number;
  status: string;
  progress: number;
  completion_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface ObligationCreate {
  contract_id: number;
  title: string;
  description: string | null;
  obligation_type: string;
  due_date: string;
  assigned_to: number;
}

export interface ObligationUpdate {
  title?: string | null;
  description?: string | null;
  obligation_type?: string | null;
  due_date?: string | null;
  assigned_to?: number | null;
}

export interface ObligationStatusUpdate {
  status: string;
}

export interface ObligationComplete {
  completion_notes?: string | null;
}

export interface ObligationDashboard {
  total_obligations: number;
  pending: number;
  in_progress: number;
  completed: number;
  overdue: number;
}

@Injectable({
  providedIn: 'root'
})
export class Obligations {

  private readonly baseUrl =
    'http://127.0.0.1:8000/obligations';

  constructor(private http: HttpClient) {}

  /**
   * Get all obligations.
   * GET /obligations
   */
  getObligations(): Observable<Obligation[]> {
    return this.http.get<Obligation[]>(
      this.baseUrl
    );
  }

  /**
   * Create a new obligation.
   * POST /obligations
   */
  createObligation(
    data: ObligationCreate
  ): Observable<Obligation> {
    return this.http.post<Obligation>(
      this.baseUrl,
      data
    );
  }

  /**
   * Get overdue obligations.
   * GET /obligations/overdue
   */
  getOverdueObligations(): Observable<Obligation[]> {
    return this.http.get<Obligation[]>(
      `${this.baseUrl}/overdue`
    );
  }

  /**
   * Get obligation dashboard statistics.
   * GET /obligations/dashboard
   */
  getObligationDashboard(): Observable<ObligationDashboard> {
    return this.http.get<ObligationDashboard>(
      `${this.baseUrl}/dashboard`
    );
  }

  /**
   * Get an obligation by ID.
   * GET /obligations/{id}
   */
  getObligationById(
    obligationId: number
  ): Observable<Obligation> {
    return this.http.get<Obligation>(
      `${this.baseUrl}/${obligationId}`
    );
  }

  /**
   * Get obligations belonging to a contract.
   * GET /obligations/contract/{contract_id}
   */
  getContractObligations(
    contractId: number
  ): Observable<Obligation[]> {
    return this.http.get<Obligation[]>(
      `${this.baseUrl}/contract/${contractId}`
    );
  }

  /**
   * Update an obligation.
   * PUT /obligations/{id}
   */
  updateObligation(
    obligationId: number,
    data: ObligationUpdate
  ): Observable<Obligation> {
    return this.http.put<Obligation>(
      `${this.baseUrl}/${obligationId}`,
      data
    );
  }

  /**
   * Update obligation status.
   * PATCH /obligations/{id}/status
   */
  updateObligationStatus(
    obligationId: number,
    status: string
  ): Observable<Obligation> {
    const data: ObligationStatusUpdate = {
      status
    };

    return this.http.patch<Obligation>(
      `${this.baseUrl}/${obligationId}/status`,
      data
    );
  }

  /**
   * Complete an obligation.
   * POST /obligations/{id}/complete
   */
  completeObligation(
    obligationId: number,
    data: ObligationComplete = {}
  ): Observable<Obligation> {
    return this.http.post<Obligation>(
      `${this.baseUrl}/${obligationId}/complete`,
      data
    );
  }
}