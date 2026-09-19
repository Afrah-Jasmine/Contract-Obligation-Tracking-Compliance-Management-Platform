import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Notification {
  id: number;
  user_id: number;
  contract_id?: number | null;
  obligation_id?: number | null;
  renewal_id?: number | null;
  title: string;
  message: string;
  type?: string;
  notification_type?: string;
  is_read?: boolean;
  status?: string;
  scheduled_at?: string | null;
  sent_at?: string | null;
  read_at?: string | null;
  created_at: string;
  updated_at?: string;
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

  private readonly baseUrl = 'https://contract-obligation-tracking-compliance-et7o.onrender.com/notifications';

  constructor(
    private http: HttpClient
  ) {}

  private normalize(item: any): Notification {
    if (!item) return item;
    const isRead = item.status === 'Read' || item.status === 'READ' || item.is_read === true || !!item.read_at;
    return {
      ...item,
      type: item.type || item.notification_type || 'General',
      notification_type: item.notification_type || item.type || 'General',
      is_read: isRead,
      status: item.status || (isRead ? 'Read' : 'Unread')
    };
  }

  // GET /notifications/
  getNotifications(): Observable<Notification[]> {
    return this.http.get<any[]>(
      `${this.baseUrl}/`
    ).pipe(
      map(items => Array.isArray(items) ? items.map(item => this.normalize(item)) : [])
    );
  }

  // GET /notifications/{notification_id}
  getNotification(
    notificationId: number
  ): Observable<Notification> {
    return this.http.get<any>(
      `${this.baseUrl}/${notificationId}`
    ).pipe(
      map(item => this.normalize(item))
    );
  }

  // POST /notifications/
  createNotification(
    notification: CreateNotificationRequest
  ): Observable<Notification> {
    return this.http.post<any>(
      `${this.baseUrl}/`,
      notification
    ).pipe(
      map(item => this.normalize(item))
    );
  }

  // PATCH /notifications/{notification_id}/read
  markAsRead(
    notificationId: number
  ): Observable<Notification> {
    return this.http.patch<any>(
      `${this.baseUrl}/${notificationId}/read`,
      {}
    ).pipe(
      map(item => this.normalize(item))
    );
  }

  // PATCH /notifications/read-all
  markAllAsRead(): Observable<Notification[]> {
    return this.http.patch<any[]>(
      `${this.baseUrl}/read-all`,
      {}
    ).pipe(
      map(items => Array.isArray(items) ? items.map(item => this.normalize(item)) : [])
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