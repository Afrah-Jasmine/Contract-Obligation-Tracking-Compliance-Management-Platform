import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://127.0.0.1:8000';

  constructor(private http: HttpClient) {}

  login(email: string, password: string) {

    return this.http.post(
      `${this.apiUrl}/users/login`,
      {
        email: email,
        password: password
      }
    );

  }

  saveToken(token: string) {
    localStorage.setItem('access_token', token);
  }

  getToken() {
    return localStorage.getItem('access_token');
  }
  getRole(): string | null {
  const token = this.getToken();

  if (!token) {
    return null;
  }

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.role || null;
  } catch {
    return null;
  }
}

  logout() {
    localStorage.removeItem('access_token');
  }

}