export type UserRole =
  | 'Administrator'
  | 'Legal Manager'
  | 'Compliance Officer'
  | 'Contract Manager'
  | 'Department Head'
  | 'Viewer';

export interface User {
  id: number;
  full_name: string;
  email: string;
  role: UserRole;
}

export interface UserCreate {
  full_name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}
