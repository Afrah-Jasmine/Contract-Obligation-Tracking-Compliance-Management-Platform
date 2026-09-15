import { Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiService } from './api';
import { User, UserCreate, UserRole, LoginResponse } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  currentUser = signal<User | null>(this.getStoredUser());

  constructor(private api: ApiService) {}

  login(email: string, password: string): Observable<LoginResponse> {
    return this.api.post<LoginResponse>('/login', {
      email,
      password
    }).pipe(
      tap(response => {
        localStorage.setItem('access_token', response.access_token);
        const user = this.decodeToken(response.access_token);
        if (user) {
          localStorage.setItem('user_info', JSON.stringify(user));
          this.currentUser.set(user);
        }
      })
    );
  }

  register(userData: UserCreate): Observable<User> {
    return this.api.post<User>('/db/users', userData);
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_info');
    this.currentUser.set(null);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  getUserRole(): UserRole | null {
    const user = this.currentUser();
    return user ? user.role : null;
  }

  private decodeToken(token: string): User | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const payload = JSON.parse(atob(parts[1]));
      return {
        id: Number(payload.sub),
        email: payload.email,
        full_name: payload.email ? payload.email.split('@')[0].toUpperCase() : 'User',
        role: payload.role || 'Viewer'
      };
    } catch (e) {
      console.error('Failed to decode JWT token:', e);
      return null;
    }
  }

  private getStoredUser(): User | null {
    const stored = localStorage.getItem('user_info');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
    const token = this.getToken();
    return token ? this.decodeToken(token) : null;
  }
}