import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api';
import { Notification, NotificationCreate } from '../models/notification.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(private api: ApiService) {}

  getNotifications(): Observable<Notification[]> {
    return this.api.get<Notification[]>('/notifications');
  }

  getNotification(id: number): Observable<Notification> {
    return this.api.get<Notification>(`/notifications/${id}`);
  }

  createNotification(notification: NotificationCreate): Observable<Notification> {
    return this.api.post<Notification>('/notifications', notification);
  }

  markAsRead(id: number): Observable<Notification> {
    return this.api.patch<Notification>(`/notifications/${id}/read`, {});
  }

  markAllAsRead(): Observable<{ message: string; updated_count: number }> {
    return this.api.patch<{ message: string; updated_count: number }>('/notifications/read-all', {});
  }
}
