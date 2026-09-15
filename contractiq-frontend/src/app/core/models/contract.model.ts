export type ContractStatus = 'Draft' | 'Under Review' | 'Approved' | 'Active' | 'Expired' | 'Terminated';

export interface Contract {
  id: number;
  title: string;
  contract_number: string;
  category: string;
  description?: string;
  start_date: string;
  end_date: string;
  status: ContractStatus;
  created_by: number;
  assigned_to?: number;
  created_at: string;
  updated_at?: string;
  reviewed_at?: string;
  approved_at?: string;
}

export interface ContractCreate {
  title: string;
  contract_number: string;
  category: string;
  description?: string;
  start_date: string;
  end_date: string;
}

export interface ContractUpdate {
  title?: string;
  category?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
}

export interface ContractStatusUpdate {
  status: ContractStatus;
}

export interface ContractAssignment {
  assigned_to: number;
}
