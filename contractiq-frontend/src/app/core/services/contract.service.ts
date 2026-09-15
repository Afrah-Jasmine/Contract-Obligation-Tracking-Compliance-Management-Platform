import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api';
import {
  Contract,
  ContractCreate,
  ContractUpdate,
  ContractStatusUpdate,
  ContractAssignment
} from '../models/contract.model';

@Injectable({
  providedIn: 'root'
})
export class ContractService {

  constructor(private api: ApiService) {}

  getContracts(): Observable<Contract[]> {
    return this.api.get<Contract[]>('/contracts');
  }

  getContract(id: number): Observable<Contract> {
    return this.api.get<Contract>(`/contracts/${id}`);
  }

  createContract(contract: ContractCreate): Observable<Contract> {
    return this.api.post<Contract>('/contracts', contract);
  }

  updateContract(id: number, contract: ContractUpdate): Observable<Contract> {
    return this.api.put<Contract>(`/contracts/${id}`, contract);
  }

  updateStatus(id: number, statusData: ContractStatusUpdate): Observable<Contract> {
    return this.api.patch<Contract>(`/contracts/${id}/status`, statusData);
  }

  assignContract(id: number, assignmentData: ContractAssignment): Observable<Contract> {
    return this.api.patch<Contract>(`/contracts/${id}/assign`, assignmentData);
  }

  submitForReview(id: number): Observable<Contract> {
    return this.api.post<Contract>(`/contracts/${id}/submit-review`, {});
  }

  approveContract(id: number): Observable<Contract> {
    return this.api.post<Contract>(`/contracts/${id}/approve`, {});
  }

  activateContract(id: number): Observable<Contract> {
    return this.api.post<Contract>(`/contracts/${id}/activate`, {});
  }
}
