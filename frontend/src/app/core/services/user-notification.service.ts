import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AppNotification {
  id: number;
  user_id: number;
  notification_type: string;
  title: string;
  message: string;
  status: string;
  read_at?: string;
  created_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserNotificationService {
  private apiUrl = `${environment.apiUrl}/notifications`;

  constructor(private http: HttpClient) {}

  getNotifications(): Observable<AppNotification[]> {
    return this.http.get<AppNotification[]>(this.apiUrl);
  }

  getNotificationById(id: number): Observable<AppNotification> {
    return this.http.get<AppNotification>(`${this.apiUrl}/${id}`);
  }

  markAsRead(id: number): Observable<AppNotification> {
    return this.http.patch<AppNotification>(`${this.apiUrl}/${id}/read`, {});
  }

  markAllAsRead(): Observable<{ message: string; updated_count: number }> {
    return this.http.patch<{ message: string; updated_count: number }>(`${this.apiUrl}/read-all`, {});
  }
}
