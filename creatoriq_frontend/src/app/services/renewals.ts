import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Renewal {
  id: number;
  contract_id: number;
  renewal_date: string;
  previous_expiry_date: string;
  new_expiry_date: string;
  status: string;
  assigned_to: number;
  approval_status: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface RenewalCreate {
  contract_id: number;
  renewal_date: string;
  previous_expiry_date: string;
  new_expiry_date: string;
  assigned_to: number;
  notes?: string | null;
}

export interface RenewalUpdate {
  renewal_date?: string | null;
  new_expiry_date?: string | null;
  assigned_to?: number | null;
  notes?: string | null;
}

export interface RenewalStatusUpdate {
  status: string;
}

export interface RenewalComplete {
  new_expiry_date: string;
}

@Injectable({
  providedIn: 'root'
})
export class Renewals {

  private readonly baseUrl = 'http://127.0.0.1:8000/renewals';

  constructor(private http: HttpClient) {}

  /**
   * Get all renewals.
   */
  getRenewals(): Observable<Renewal[]> {
    return this.http.get<Renewal[]>(this.baseUrl);
  }

  /**
   * Get renewals whose previous expiry date
   * falls within the specified number of days.
   */
  getUpcomingRenewals(days: number = 90): Observable<Renewal[]> {
    return this.http.get<Renewal[]>(
      `${this.baseUrl}/upcoming?days=${days}`
    );
  }

  /**
   * Get renewals whose previous expiry date
   * has already passed.
   */
  getExpiredRenewals(): Observable<Renewal[]> {
    return this.http.get<Renewal[]>(
      `${this.baseUrl}/expired`
    );
  }

  /**
   * Get a single renewal by ID.
   */
  getRenewalById(id: number): Observable<Renewal> {
    return this.http.get<Renewal>(
      `${this.baseUrl}/${id}`
    );
  }

  /**
   * Get renewals associated with a contract.
   */
  getContractRenewals(contractId: number): Observable<Renewal[]> {
    return this.http.get<Renewal[]>(
      `${this.baseUrl}/contract/${contractId}`
    );
  }

  /**
   * Create a new renewal.
   */
  createRenewal(data: RenewalCreate): Observable<Renewal> {
    return this.http.post<Renewal>(
      this.baseUrl,
      data
    );
  }

  /**
   * Update an existing renewal.
   */
  updateRenewal(
    id: number,
    data: RenewalUpdate
  ): Observable<Renewal> {
    return this.http.put<Renewal>(
      `${this.baseUrl}/${id}`,
      data
    );
  }

  /**
   * Update renewal status.
   */
  updateRenewalStatus(
    id: number,
    data: RenewalStatusUpdate
  ): Observable<Renewal> {
    return this.http.patch<Renewal>(
      `${this.baseUrl}/${id}/status`,
      data
    );
  }

  /**
   * Complete a renewal.
   */
  completeRenewal(
    id: number,
    data: RenewalComplete
  ): Observable<Renewal> {
    return this.http.post<Renewal>(
      `${this.baseUrl}/${id}/renew`,
      data
    );
  }
}