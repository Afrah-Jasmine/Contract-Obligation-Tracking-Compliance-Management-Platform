import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpHeaders
} from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class NotificationsService {

  private apiUrl =
    'http://127.0.0.1:8000/notifications';


  constructor(
    private http: HttpClient
  ) {}


  // =====================================
  // AUTH HEADERS
  // =====================================

  private getHeaders(): HttpHeaders {

    const token =
      localStorage.getItem('access_token');

    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

  }


  // =====================================
  // GET ALL NOTIFICATIONS
  // =====================================

  getNotifications() {

    return this.http.get<any[]>(
      `${this.apiUrl}`,
      {
        headers: this.getHeaders()
      }
    );

  }


  // =====================================
  // GET NOTIFICATION BY ID
  // =====================================

  getNotification(
    notificationId: number
  ) {

    return this.http.get<any>(
      `${this.apiUrl}/${notificationId}`,
      {
        headers: this.getHeaders()
      }
    );

  }


  // =====================================
  // MARK NOTIFICATION AS READ
  // =====================================

  markAsRead(
    notificationId: number
  ) {

    return this.http.patch<any>(
      `${this.apiUrl}/${notificationId}/read`,
      {},
      {
        headers: this.getHeaders()
      }
    );

  }


  // =====================================
  // MARK ALL AS READ
  // =====================================

  markAllAsRead() {

    return this.http.patch<any>(
      `${this.apiUrl}/read-all`,
      {},
      {
        headers: this.getHeaders()
      }
    );

  }


  // =====================================
  // CREATE NOTIFICATION
  // =====================================

  createNotification(
    notificationData: any
  ) {

    return this.http.post<any>(
      `${this.apiUrl}`,
      notificationData,
      {
        headers: this.getHeaders()
      }
    );

  }


  // =====================================
  // TRIGGER RENEWAL REMINDERS
  // =====================================

  triggerRenewalReminders() {

    return this.http.post<any>(
      `${this.apiUrl}/renewal-reminders`,
      {},
      {
        headers: this.getHeaders()
      }
    );

  }


  // =====================================
  // TRIGGER OBLIGATION DUE REMINDERS
  // =====================================

  triggerObligationDueReminders() {

    return this.http.post<any>(
      `${this.apiUrl}/obligation-due-reminders`,
      {},
      {
        headers: this.getHeaders()
      }
    );

  }


  // =====================================
  // TRIGGER COMPLIANCE ALERTS
  // =====================================

  triggerComplianceAlerts() {

    return this.http.post<any>(
      `${this.apiUrl}/compliance-alerts`,
      {},
      {
        headers: this.getHeaders()
      }
    );

  }

}