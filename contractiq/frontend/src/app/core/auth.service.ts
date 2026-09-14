import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { User, UserRole } from './models';
import { API_BASE } from './api-base';

interface TokenResponse { access_token: string; token_type: string; }

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly _user = signal<User | null>(this.readCachedUser());
  readonly user = this._user.asReadonly();
  readonly isAuthenticated = computed(() => !!this.token);

  get token(): string | null { return localStorage.getItem('contractiq_token'); }

  private readCachedUser(): User | null {
    try {
      const raw = localStorage.getItem('contractiq_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  login(email: string, password: string): Observable<TokenResponse> {
    const body = new URLSearchParams();
    body.set('username', email.trim());
    body.set('password', password);
    return this.http.post<TokenResponse>(`${API_BASE}/auth/login`, body.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).pipe(
      tap(res => localStorage.setItem('contractiq_token', res.access_token))
    );
  }

  register(payload: { full_name: string; email: string; password: string; role: UserRole }): Observable<User> {
    return this.http.post<User>(`${API_BASE}/auth/register`, payload);
  }

  fetchMe(): Observable<User> {
    return this.http.get<User>(`${API_BASE}/users/me`).pipe(
      tap(user => {
        this._user.set(user);
        localStorage.setItem('contractiq_user', JSON.stringify(user));
      })
    );
  }

  setUser(user: User): void { this._user.set(user); localStorage.setItem('contractiq_user', JSON.stringify(user)); }

  logout(): void {
    localStorage.removeItem('contractiq_token');
    localStorage.removeItem('contractiq_user');
    this._user.set(null);
    this.router.navigateByUrl('/login');
  }

  hasRole(...roles: UserRole[]): boolean {
    const user = this._user();
    return !!user && roles.includes(user.role);
  }
}
