import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api';
import { User, UserCreate } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private api: ApiService) {}

  getUsers(): Observable<User[]> {
    return this.api.get<User[]>('/db/users');
  }

  getUser(id: number): Observable<User> {
    return this.api.get<User>(`/users/${id}`);
  }

  createUser(userData: UserCreate): Observable<User> {
    return this.api.post<User>('/db/users', userData);
  }

  updateUser(id: number, userData: UserCreate): Observable<User> {
    return this.api.put<User>(`/users/${id}`, userData);
  }

  deleteUser(id: number): Observable<{ message: string }> {
    return this.api.delete<{ message: string }>(`/users/${id}`);
  }
}
