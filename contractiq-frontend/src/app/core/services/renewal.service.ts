import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api';
import {
  Renewal,
  RenewalCreate,
  RenewalUpdate,
  RenewalStatusUpdate,
  RenewalComplete
} from '../models/renewal.model';

@Injectable({
  providedIn: 'root'
})
export class RenewalService {

  constructor(private api: ApiService) {}

  getRenewals(): Observable<Renewal[]> {
    return this.api.get<Renewal[]>('/renewals');
  }

  getUpcomingRenewals(days: number = 90): Observable<Renewal[]> {
    return this.api.get<Renewal[]>(`/renewals/upcoming?days=${days}`);
  }

  getExpiredRenewals(): Observable<Renewal[]> {
    return this.api.get<Renewal[]>('/renewals/expired');
  }

  getRenewal(id: number): Observable<Renewal> {
    return this.api.get<Renewal>(`/renewals/${id}`);
  }

  getContractRenewals(contractId: number): Observable<Renewal[]> {
    return this.api.get<Renewal[]>(`/contracts/${contractId}/renewals`);
  }

  createRenewal(renewal: RenewalCreate): Observable<Renewal> {
    return this.api.post<Renewal>('/renewals', renewal);
  }

  updateRenewal(id: number, renewal: RenewalUpdate): Observable<Renewal> {
    return this.api.put<Renewal>(`/renewals/${id}`, renewal);
  }

  updateStatus(id: number, statusData: RenewalStatusUpdate): Observable<Renewal> {
    return this.api.patch<Renewal>(`/renewals/${id}/status`, statusData);
  }

  completeRenewal(id: number, completeData: RenewalComplete): Observable<Renewal> {
    return this.api.post<Renewal>(`/renewals/${id}/renew`, completeData);
  }
}
