export type ObligationStatus = 'Pending' | 'In Progress' | 'Completed' | 'Overdue';

export interface Obligation {
  id: number;
  contract_id: number;
  title: string;
  description?: string;
  obligation_type: string;
  due_date: string;
  status: ObligationStatus;
  progress: number;
  assigned_to: number;
  created_at: string;
  updated_at?: string;
}

export interface ObligationCreate {
  contract_id: number;
  title: string;
  description?: string;
  obligation_type: string;
  due_date: string;
  assigned_to: number;
}

export interface ObligationUpdate {
  title?: string;
  description?: string;
  obligation_type?: string;
  due_date?: string;
}

export interface ObligationAssignment {
  assigned_to: number;
}

export interface ObligationStatusUpdate {
  status: ObligationStatus;
}

export interface ObligationProgressUpdate {
  progress: number;
}
