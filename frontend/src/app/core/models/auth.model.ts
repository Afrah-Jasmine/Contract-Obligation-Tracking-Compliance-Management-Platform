export interface LoginRequest {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user?: User;
}

export interface User {
  user_id: number;
  name: string;
  email: string;
  role: string;
  department?: string;
  is_active?: boolean;
}
