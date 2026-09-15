import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api';
import {
  Obligation,
  ObligationCreate,
  ObligationUpdate,
  ObligationAssignment,
  ObligationStatusUpdate,
  ObligationProgressUpdate
} from '../models/obligation.model';

@Injectable({
  providedIn: 'root'
})
export class ObligationService {

  constructor(private api: ApiService) {}

  getObligations(): Observable<Obligation[]> {
    return this.api.get<Obligation[]>('/obligations');
  }

  getOverdueObligations(): Observable<Obligation[]> {
    return this.api.get<Obligation[]>('/obligations/overdue');
  }

  getObligation(id: number): Observable<Obligation> {
    return this.api.get<Obligation>(`/obligations/${id}`);
  }

  createObligation(obligation: ObligationCreate): Observable<Obligation> {
    return this.api.post<Obligation>('/obligations', obligation);
  }

  updateObligation(id: number, obligation: ObligationUpdate): Observable<Obligation> {
    return this.api.put<Obligation>(`/obligations/${id}`, obligation);
  }

  assignObligation(id: number, assignmentData: ObligationAssignment): Observable<Obligation> {
    return this.api.patch<Obligation>(`/obligations/${id}/assign`, assignmentData);
  }

  updateStatus(id: number, statusData: ObligationStatusUpdate): Observable<Obligation> {
    return this.api.patch<Obligation>(`/obligations/${id}/status`, statusData);
  }

  updateProgress(id: number, progressData: ObligationProgressUpdate): Observable<Obligation> {
    return this.api.patch<Obligation>(`/obligations/${id}/progress`, progressData);
  }

  completeObligation(id: number): Observable<Obligation> {
    return this.api.post<Obligation>(`/obligations/${id}/complete`, {});
  }
}
