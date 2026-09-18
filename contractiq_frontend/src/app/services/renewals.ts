import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


/* =========================================================
   RENEWAL INTERFACE
   ========================================================= */

export interface Renewal {

  id: number;

  contract_id: number;

  assigned_to: number;

  renewal_date: string;

  notice_days: number;

  status: string;

  new_expiry_date: string | null;

  notes: string | null;

  previous_expiry_date: string;

  created_at: string;

  updated_at: string;
}


/* =========================================================
   CREATE RENEWAL REQUEST
   ========================================================= */

export interface CreateRenewalRequest {

  contract_id: number;

  assigned_to: number;

  renewal_date: string;

  notice_days: number;

  status: string;

  new_expiry_date: string | null;

  notes: string;

  previous_expiry_date: string;
}


/* =========================================================
   UPDATE RENEWAL REQUEST
   ========================================================= */

export interface UpdateRenewalRequest {

  assigned_to: number;

  renewal_date: string;

  notice_days: number;

  status: string;

  new_expiry_date: string | null;

  notes: string;

  previous_expiry_date: string;
}


/* =========================================================
   SERVICE
   ========================================================= */

@Injectable({
  providedIn: 'root'
})
export class RenewalsService {
private readonly baseUrl = 'https://contract-obligation-tracking-compliance-zagb.onrender.com/renewals';

  constructor(
    private http: HttpClient
  ) {}


  /* =======================================================
     GET ALL RENEWALS
     ======================================================= */

  getRenewals(): Observable<Renewal[]> {

    return this.http.get<Renewal[]>(
      `${this.baseUrl}/`
    );

  }


  /* =======================================================
     GET SINGLE RENEWAL
     ======================================================= */

  getRenewal(
    renewalId: number
  ): Observable<Renewal> {

    return this.http.get<Renewal>(
      `${this.baseUrl}/${renewalId}`
    );

  }


  /* =======================================================
     CREATE RENEWAL
     ======================================================= */

  createRenewal(
    renewal: CreateRenewalRequest
  ): Observable<Renewal> {

    return this.http.post<Renewal>(
      `${this.baseUrl}/`,
      renewal
    );

  }


  /* =======================================================
     UPDATE RENEWAL
     ======================================================= */

  updateRenewal(
    renewalId: number,
    renewalData: UpdateRenewalRequest
  ): Observable<Renewal> {

    return this.http.put<Renewal>(
      `${this.baseUrl}/${renewalId}`,
      renewalData
    );

  }

}