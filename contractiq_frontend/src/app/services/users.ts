import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface User {
  id: number;
  full_name: string;
  email: string;
  role: string;
  is_active: boolean;
}

export interface CreateUserRequest {
  full_name: string;
  email: string;
  role: string;
  password: string;
}

export interface UpdateUserRequest {
  full_name: string;
  email: string;
  role: string;
  password: string;
  is_active: boolean;
}

export interface PasswordUpdateRequest {
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class UsersService {

private readonly baseUrl = 'https://contract-obligation-tracking-compliance-zagb.onrender.com/users';
  constructor(private http: HttpClient) {}

  getUsers(): Observable<User[]> {
  return this.http.get<User[]>(`${this.baseUrl}/`);
}
  getUser(userId: number): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/${userId}`);
  }

createUser(user: CreateUserRequest): Observable<User> {
  return this.http.post<User>(`${this.baseUrl}/`, user);
}

  updateUser(
    userId: number,
    user: UpdateUserRequest
  ): Observable<User> {
    return this.http.put<User>(
      `${this.baseUrl}/${userId}`,
      user
    );
  }

  updatePassword(
    userId: number,
    password: string
  ): Observable<User> {
    const data: PasswordUpdateRequest = {
      password: password
    };

    return this.http.patch<User>(
      `${this.baseUrl}/${userId}/password`,
      data
    );
  }

  deleteUser(userId: number): Observable<any> {
    return this.http.delete(
      `${this.baseUrl}/${userId}`
    );
  }
}