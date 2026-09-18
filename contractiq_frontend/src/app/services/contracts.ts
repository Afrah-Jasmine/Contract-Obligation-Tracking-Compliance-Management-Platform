import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Contract {
  id: number;
  owner_id: number;
  assigned_to: number | null;
  contract_code: string;
  title: string;
  description: string;
  counterparty: string;
  category: string;
  department: string | null;
  status: string;
  risk_level: string;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
  reviewed_at: string | null;
  approved_at: string | null;
}

export interface CreateContractRequest {
  contract_code: string;
  title: string;
  description: string;
  counterparty: string;
  category: string;
  department: string | null;
  status: string;
  risk_level: string;
  start_date: string;
  end_date: string;
  assigned_to?: number | null;
}

export interface UpdateContractRequest {
  contract_code: string;
  title: string;
  description: string;
  counterparty: string;
  category: string;
  department: string | null;
  risk_level: string;
  start_date: string;
  end_date: string;
}

@Injectable({
  providedIn: 'root'
})
export class ContractsService {

  private readonly baseUrl = 'http://127.0.0.1:8080/contracts';

  constructor(private http: HttpClient) {}

  getContracts(): Observable<Contract[]> {
    return this.http.get<Contract[]>(`${this.baseUrl}/`);
  }

  getContract(contractId: number): Observable<Contract> {
    return this.http.get<Contract>(
      `${this.baseUrl}/${contractId}`
    );
  }

  createContract(
    contract: CreateContractRequest
  ): Observable<Contract> {
    return this.http.post<Contract>(
      `${this.baseUrl}/`,
      contract
    );
  }

  updateContract(
    contractId: number,
    contractData: UpdateContractRequest
  ): Observable<Contract> {
    return this.http.put<Contract>(
      `${this.baseUrl}/${contractId}`,
      contractData
    );
  }
}