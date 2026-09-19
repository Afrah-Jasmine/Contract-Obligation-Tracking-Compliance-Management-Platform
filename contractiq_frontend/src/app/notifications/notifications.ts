import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { timeout, finalize } from 'rxjs';

import {
  NotificationsService,
  Notification,
  CreateNotificationRequest
} from '../services/notifications';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    FormsModule
  ],
  templateUrl: './notifications.html',
  styleUrl: './notifications.css'
})
export class Notifications implements OnInit {

  notifications: Notification[] = [];

  loading = true;
  errorMessage = '';

  showCreateForm = false;
  creating = false;

  createError = '';
  createSuccess = '';

  newNotification: CreateNotificationRequest = {
    user_id: 0,
    contract_id: null,
    obligation_id: null,
    renewal_id: null,
    notification_type: 'General',
    title: '',
    message: ''
  };

  markingReadId: number | null = null;
  markingAllRead = false;

  generatingAlerts = false;
  alertSuccess = '';
  alertError = '';

  constructor(
    private notificationsService: NotificationsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadNotifications();
  }

  get totalNotifications(): number {
    return this.notifications.length;
  }

  get unreadNotifications(): number {
    return this.notifications.filter(
      notification => !notification.is_read
    ).length;
  }

  get readNotifications(): number {
    return this.notifications.filter(
      notification => notification.is_read
    ).length;
  }

  loadNotifications(): void {

    this.loading = true;
    this.errorMessage = '';

    this.notificationsService
      .getNotifications()
      .pipe(
        timeout(60000),
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({

        next: (data: Notification[]) => {
          this.notifications =
            Array.isArray(data) ? data : [];
        },

        error: (error: any) => {

          console.error(
            'Notifications error:',
            error
          );

          if (error.status === 401) {

            this.errorMessage =
              'You are not authorized to view notifications.';

          } else if (error.status === 403) {

            this.errorMessage =
              'You do not have permission to view notifications.';

          } else if (error.status === 0) {

            this.errorMessage =
              'Unable to connect to ContractIQ server.';

          } else {

            this.errorMessage =
              error.error?.detail ||
              'Unable to load notifications.';
          }
        }
      });
  }

  openCreateForm(): void {

    this.showCreateForm = true;

    this.createError = '';
    this.createSuccess = '';

    this.newNotification = {
      user_id: 0,
      contract_id: null,
      obligation_id: null,
      renewal_id: null,
      notification_type: 'General',
      title: '',
      message: ''
    };

    document.body.style.overflow = 'hidden';
  }

  closeCreateForm(): void {

    this.showCreateForm = false;
    this.createError = '';

    document.body.style.overflow = '';
  }

  createNotification(): void {

    this.createError = '';
    this.createSuccess = '';

    if (
      !this.newNotification.user_id ||
      !this.newNotification.title.trim() ||
      !this.newNotification.message.trim()
    ) {

      this.createError =
        'Please fill in User ID, title and message.';

      return;
    }

    this.creating = true;

    this.notificationsService
      .createNotification(this.newNotification)
      .subscribe({

        next: (created: Notification) => {

          console.log(
            'Notification created:',
            created
          );

          this.creating = false;
          this.showCreateForm = false;

          this.createSuccess =
            'Notification created successfully.';

          document.body.style.overflow = '';

          this.loadNotifications();

          setTimeout(() => {
            this.createSuccess = '';
          }, 4000);
        },

        error: (error: any) => {

          console.error(
            'Create notification error:',
            error
          );

          this.creating = false;

          this.createError =
            error.error?.detail ||
            'Unable to create notification.';
        }
      });
  }

  markAsRead(notification: Notification): void {

    if (notification.is_read) {
      return;
    }

    this.markingReadId = notification.id;

    this.notificationsService
      .markAsRead(notification.id)
      .subscribe({

        next: (updated: Notification) => {

          const index =
            this.notifications.findIndex(
              item => item.id === notification.id
            );

          if (index !== -1) {
            this.notifications[index] = updated;
          }

          this.markingReadId = null;
          this.cdr.detectChanges();
        },

        error: (error: any) => {

          console.error(
            'Mark as read error:',
            error
          );

          this.markingReadId = null;

          this.errorMessage =
            error.error?.detail ||
            'Unable to mark notification as read.';

          this.cdr.detectChanges();
        }
      });
  }

  markAllAsRead(): void {

    if (this.unreadNotifications === 0) {
      return;
    }

    this.markingAllRead = true;

    this.notificationsService
      .markAllAsRead()
      .subscribe({

        next: (updatedNotifications: Notification[]) => {

          if (Array.isArray(updatedNotifications)) {

            for (
              const updated of updatedNotifications
            ) {

              const index =
                this.notifications.findIndex(
                  item => item.id === updated.id
                );

              if (index !== -1) {
                this.notifications[index] = updated;
              }
            }
          }

          this.markingAllRead = false;
          this.cdr.detectChanges();
        },

        error: (error: any) => {

          console.error(
            'Mark all as read error:',
            error
          );

          this.markingAllRead = false;

          this.errorMessage =
            error.error?.detail ||
            'Unable to mark all notifications as read.';

          this.cdr.detectChanges();
        }
      });
  }

  generateAlerts(): void {

    this.alertSuccess = '';
    this.alertError = '';
    this.generatingAlerts = true;

    this.notificationsService
      .generateAlerts()
      .subscribe({

        next: (result: any) => {

          console.log(
            'Generated alerts:',
            result
          );

          this.generatingAlerts = false;

          const totalCreated =
            (result.renewal_notifications_created || 0) +
            (result.obligation_notifications_created || 0) +
            (result.compliance_notifications_created || 0);

          this.alertSuccess =
            `${totalCreated} alert${
              totalCreated === 1 ? '' : 's'
            } generated successfully.`;

          this.loadNotifications();

          setTimeout(() => {
            this.alertSuccess = '';
          }, 5000);
        },

        error: (error: any) => {

          console.error(
            'Generate alerts error:',
            error
          );

          this.generatingAlerts = false;

          this.alertError =
            error.error?.detail ||
            'Unable to generate automatic alerts.';
        }
      });
  }

}