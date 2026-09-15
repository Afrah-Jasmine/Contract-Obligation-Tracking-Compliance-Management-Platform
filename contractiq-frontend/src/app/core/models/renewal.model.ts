export type RenewalStatus = 'Upcoming' | 'In Progress' | 'Renewed' | 'Expired' | 'Cancelled';

export interface Renewal {
  id: number;
  contract_id: number;
  renewal_date: string;
  previous_expiry_date: string;
  new_expiry_date?: string;
  status: RenewalStatus;
  assigned_to?: number;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

export interface RenewalCreate {
  contract_id: number;
  renewal_date: string;
  previous_expiry_date: string;
  new_expiry_date?: string;
  assigned_to?: number;
  notes?: string;
}

export interface RenewalUpdate {
  renewal_date?: string;
  new_expiry_date?: string;
  assigned_to?: number;
  notes?: string;
}

export interface RenewalStatusUpdate {
  status: RenewalStatus;
}

export interface RenewalComplete {
  renewal_date?: string;
  new_expiry_date?: string;
}
