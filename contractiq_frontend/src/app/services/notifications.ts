import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Notification {
  id: number;
  user_id: number;
  contract_id?: number | null;
  obligation_id?: number | null;
  renewal_id?: number | null;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export interface CreateNotificationRequest {
  user_id: number;
  contract_id?: number | null;
  obligation_id?: number | null;
  renewal_id?: number | null;
  notification_type: string;
  title: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
private readonly baseUrl = 'https://contract-obligation-tracking-compliance-zagb.onrender.com/notifications';
  constructor(
    private http: HttpClient
  ) {}

  // GET /notifications/
  getNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(
      `${this.baseUrl}/`
    );
  }

  // GET /notifications/{notification_id}
  getNotification(
    notificationId: number
  ): Observable<Notification> {
    return this.http.get<Notification>(
      `${this.baseUrl}/${notificationId}`
    );
  }

  // POST /notifications/
  createNotification(
    notification: CreateNotificationRequest
  ): Observable<Notification> {
    return this.http.post<Notification>(
      `${this.baseUrl}/`,
      notification
    );
  }

  // PATCH /notifications/{notification_id}/read
  markAsRead(
    notificationId: number
  ): Observable<Notification> {
    return this.http.patch<Notification>(
      `${this.baseUrl}/${notificationId}/read`,
      {}
    );
  }

  // PATCH /notifications/read-all
  markAllAsRead(): Observable<Notification[]> {
    return this.http.patch<Notification[]>(
      `${this.baseUrl}/read-all`,
      {}
    );
  }

  // POST /notifications/generate-alerts
  generateAlerts(): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}/generate-alerts`,
      {}
    );
  }
}