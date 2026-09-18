
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

interface LoginRequest {
  email: string;
  password: string;
}

interface TokenResponse {
  access_token: string;
  token_type: string;
}

interface TokenPayload {
  sub: string;
  email: string;
  role: string;
  exp: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly baseUrl = 'https://contract-obligation-tracking-compliance-zagb.onrender.com';
  private readonly tokenKey = 'contractiq_token';

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<TokenResponse> {
    const loginData: LoginRequest = {
      email,
      password
    };

    return this.http
      .post<TokenResponse>(`${this.baseUrl}/auth/login`, loginData)
      .pipe(
        tap(response => {
          localStorage.setItem(this.tokenKey, response.access_token);
        })
      );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isLoggedIn(): boolean {
    return this.getToken() !== null;
  }

  getUserRole(): string | null {
    const token = this.getToken();

    if (!token) {
      return null;
    }

    try {
      const payload = token.split('.')[1];
      const decodedPayload = atob(
        payload.replace(/-/g, '+').replace(/_/g, '/')
      );

      const tokenData: TokenPayload = JSON.parse(decodedPayload);

      return tokenData.role;
    } catch {
      return null;
    }
  }
}