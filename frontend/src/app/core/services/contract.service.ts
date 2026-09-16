import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ContractModel {
  id?: number;
  contract_id?: number;
  title: string;
  contract_number: string;
  category: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  status: string;
  created_by?: number;
  assigned_to?: number;
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ContractService {
  private apiUrl = `${environment.apiUrl}/contracts`;

  constructor(private http: HttpClient) {}

  getContracts(): Observable<ContractModel[]> {
    return this.http.get<ContractModel[]>(this.apiUrl);
  }

  getContractById(id: number): Observable<ContractModel> {
    return this.http.get<ContractModel>(`${this.apiUrl}/${id}`);
  }

  createContract(contract: Partial<ContractModel>): Observable<ContractModel> {
    return this.http.post<ContractModel>(this.apiUrl, contract);
  }

  updateContract(id: number, contract: Partial<ContractModel>): Observable<ContractModel> {
    return this.http.put<ContractModel>(`${this.apiUrl}/${id}`, contract);
  }

  deleteContract(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  updateStatus(id: number, status: string): Observable<ContractModel> {
    return this.http.patch<ContractModel>(`${this.apiUrl}/${id}/status`, { status });
  }

  assignUser(id: number, assigned_to: number): Observable<ContractModel> {
    return this.http.patch<ContractModel>(`${this.apiUrl}/${id}/assign`, { assigned_to });
  }
}
