import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE } from './api-base';
import {
  Contract, ContractListItem, Obligation, ObligationListItem, Renewal,
  ComplianceListItem, ComplianceSummary, ContractCompliance, HighRiskContract,
  NonCompliantContract, AppNotification, DashboardSummary, User, Activity, AuditLog
} from './models';

@Injectable({ providedIn: 'root' })
export class ContractsService {
  private readonly http = inject(HttpClient);
  list(): Observable<ContractListItem[]> { return this.http.get<ContractListItem[]>(`${API_BASE}/contracts`); }
  get(id: number): Observable<Contract> { return this.http.get<Contract>(`${API_BASE}/contracts/${id}`); }
  create(payload: unknown): Observable<Contract> { return this.http.post<Contract>(`${API_BASE}/contracts`, payload); }
  update(id: number, payload: unknown): Observable<Contract> { return this.http.put<Contract>(`${API_BASE}/contracts/${id}`, payload); }
  setStatus(id: number, status: string): Observable<Contract> { return this.http.patch<Contract>(`${API_BASE}/contracts/${id}/status`, { status }); }
  submitReview(id: number): Observable<Contract> { return this.http.post<Contract>(`${API_BASE}/contracts/${id}/submit-review`, {}); }
  approve(id: number): Observable<Contract> { return this.http.post<Contract>(`${API_BASE}/contracts/${id}/approve`, {}); }
  activate(id: number): Observable<Contract> { return this.http.post<Contract>(`${API_BASE}/contracts/${id}/activate`, {}); }
  assign(id: number, assigned_to: number): Observable<Contract> { return this.http.patch<Contract>(`${API_BASE}/contracts/${id}/assign`, { assigned_to }); }
  compliance(id: number): Observable<ContractCompliance> { return this.http.get<ContractCompliance>(`${API_BASE}/contracts/${id}/compliance`); }
}

@Injectable({ providedIn: 'root' })
export class ObligationsService {
  private readonly http = inject(HttpClient);
  list(): Observable<ObligationListItem[]> { return this.http.get<ObligationListItem[]>(`${API_BASE}/obligations`); }
  get(id: number): Observable<Obligation> { return this.http.get<Obligation>(`${API_BASE}/obligations/${id}`); }
  forContract(contractId: number): Observable<ObligationListItem[]> { return this.http.get<ObligationListItem[]>(`${API_BASE}/contracts/${contractId}/obligations`); }
  create(payload: unknown): Observable<Obligation> { return this.http.post<Obligation>(`${API_BASE}/obligations`, payload); }
  update(id: number, payload: unknown): Observable<Obligation> { return this.http.put<Obligation>(`${API_BASE}/obligations/${id}`, payload); }
  setStatus(id: number, status: string): Observable<Obligation> { return this.http.patch<Obligation>(`${API_BASE}/obligations/${id}/status`, { status }); }
  complete(id: number): Observable<Obligation> { return this.http.post<Obligation>(`${API_BASE}/obligations/${id}/complete`, {}); }
}

@Injectable({ providedIn: 'root' })
export class RenewalsService {
  private readonly http = inject(HttpClient);
  list(): Observable<Renewal[]> { return this.http.get<Renewal[]>(`${API_BASE}/renewals`); }
  upcoming(): Observable<Renewal[]> { return this.http.get<Renewal[]>(`${API_BASE}/renewals/upcoming`); }
  expiredContracts(): Observable<Renewal[]> { return this.http.get<Renewal[]>(`${API_BASE}/renewals/expired-contracts`); }
  get(id: number): Observable<Renewal> { return this.http.get<Renewal>(`${API_BASE}/renewals/${id}`); }
  forContract(contractId: number): Observable<Renewal[]> { return this.http.get<Renewal[]>(`${API_BASE}/contracts/${contractId}/renewals`); }
  create(payload: unknown): Observable<Renewal> { return this.http.post<Renewal>(`${API_BASE}/renewals`, payload); }
  update(id: number, payload: unknown): Observable<Renewal> { return this.http.put<Renewal>(`${API_BASE}/renewals/${id}`, payload); }
  setStatus(id: number, status: string): Observable<Renewal> { return this.http.patch<Renewal>(`${API_BASE}/renewals/${id}/status`, { status }); }
  renew(id: number, newExpiryDate: string): Observable<Renewal> {
    return this.http.post<Renewal>(`${API_BASE}/renewals/${id}/renew`, { new_expiry_date: newExpiryDate });
  }
}

@Injectable({ providedIn: 'root' })
export class ComplianceService {
  private readonly http = inject(HttpClient);
  summary(): Observable<ComplianceSummary> { return this.http.get<ComplianceSummary>(`${API_BASE}/compliance/summary`); }
  list(): Observable<ComplianceListItem[]> { return this.http.get<ComplianceListItem[]>(`${API_BASE}/compliance`); }
  nonCompliant(): Observable<NonCompliantContract[]> { return this.http.get<NonCompliantContract[]>(`${API_BASE}/compliance/non-compliant`); }
  highRisk(): Observable<HighRiskContract[]> { return this.http.get<HighRiskContract[]>(`${API_BASE}/compliance/high-risk`); }
}

@Injectable({ providedIn: 'root' })
export class NotificationsService {
  private readonly http = inject(HttpClient);
  list(): Observable<AppNotification[]> { return this.http.get<AppNotification[]>(`${API_BASE}/notifications`); }
  get(id: number): Observable<AppNotification> { return this.http.get<AppNotification>(`${API_BASE}/notifications/${id}`); }
  markRead(id: number): Observable<AppNotification> { return this.http.patch<AppNotification>(`${API_BASE}/notifications/${id}/read`, {}); }
  markAllRead(): Observable<AppNotification[]> { return this.http.patch<AppNotification[]>(`${API_BASE}/notifications/read-all`, {}); }
}

@Injectable({ providedIn: 'root' })
export class ReportsService {
  private readonly http = inject(HttpClient);

  dashboard(): Observable<DashboardSummary> { return this.http.get<DashboardSummary>(`${API_BASE}/dashboard/summary`); }

  contractsSummary(from?: string, to?: string): Observable<any> {
    return this.http.get(`${API_BASE}/reports/contracts/summary`, { params: this.dateParams(from, to) });
  }
  obligationsSummary(from?: string, to?: string): Observable<any> {
    return this.http.get(`${API_BASE}/reports/obligations/summary`, { params: this.dateParams(from, to) });
  }
  renewalsSummary(upcomingDays = 30): Observable<any> {
    return this.http.get(`${API_BASE}/reports/renewals/summary`, { params: new HttpParams().set('upcoming_days', upcomingDays) });
  }
  complianceSummary(from?: string, to?: string): Observable<any> {
    return this.http.get(`${API_BASE}/reports/compliance/summary`, { params: this.dateParams(from, to) });
  }
  risk(): Observable<any> { return this.http.get(`${API_BASE}/reports/risk`); }
  overdueObligations(): Observable<any> { return this.http.get(`${API_BASE}/dashboard/overdue-obligations`); }

  export(kind: string, fmt: 'excel' | 'pdf'): Observable<Blob> {
    return this.http.get(`${API_BASE}/reports/${kind}/export/${fmt}`, { responseType: 'blob' });
  }

  private dateParams(from?: string, to?: string): HttpParams {
    let params = new HttpParams();
    if (from) params = params.set('from_date', from);
    if (to) params = params.set('to_date', to);
    return params;
  }
}

@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly http = inject(HttpClient);
  list(): Observable<User[]> { return this.http.get<User[]>(`${API_BASE}/users`); }
  get(id: number): Observable<User> { return this.http.get<User>(`${API_BASE}/users/${id}`); }
  updateRole(id: number, role: string): Observable<User> { return this.http.patch<User>(`${API_BASE}/users/${id}/role`, { role }); }
  deactivate(id: number): Observable<void> { return this.http.delete<void>(`${API_BASE}/users/${id}`); }
  updateMe(payload: { full_name?: string }): Observable<User> { return this.http.put<User>(`${API_BASE}/users/me`, payload); }
}

@Injectable({ providedIn: 'root' })
export class ActivityService {
  private readonly http = inject(HttpClient);
  list(limit = 100): Observable<Activity[]> {
    return this.http.get<Activity[]>(`${API_BASE}/activity`, { params: { limit } });
  }
  audit(limit = 100): Observable<AuditLog[]> {
    return this.http.get<AuditLog[]>(`${API_BASE}/audit`, { params: { limit } });
  }
}
