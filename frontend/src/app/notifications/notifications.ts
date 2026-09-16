import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { FormsModule } from '@angular/forms';

import { NotificationsService } from '../services/notifications.service';


@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './notifications.html',
  styleUrl: './notifications.css'
})


export class Notifications implements OnInit {

  // ===============================
  // NOTIFICATIONS DATA
  // ===============================

  notifications: any[] = [];

  isLoading = false;

  errorMessage = '';

  successMessage = '';


  // ===============================
  // SEARCH & FILTER
  // ===============================

  searchText = '';

  statusFilter = '';


  constructor(
    private notificationsService: NotificationsService,
    private cdr: ChangeDetectorRef
  ) {}


  // ===============================
  // INITIALIZE
  // ===============================

  ngOnInit(): void {

    this.loadNotifications();

  }


  // ===============================
  // LOAD NOTIFICATIONS
  // ===============================

  loadNotifications(): void {

    this.isLoading = true;

    this.errorMessage = '';

    this.notificationsService
      .getNotifications()
      .subscribe({

        next: (data: any[]) => {

          console.log(
            'Notifications:',
            data
          );

          this.notifications = data;

          this.isLoading = false;

          this.cdr.detectChanges();

        },

        error: (error: any) => {

          console.error(
            'Error loading notifications:',
            error
          );

          this.isLoading = false;

          this.errorMessage =
            error.error?.detail ||
            'Unable to load notifications.';

          this.cdr.detectChanges();

        }

      });

  }


  // ===============================
  // FILTERED NOTIFICATIONS
  // ===============================

  get filteredNotifications(): any[] {

    return this.notifications.filter(
      (notification: any) => {

        const search =
          this.searchText
            .toLowerCase()
            .trim();


        const matchesSearch =
          !search ||

          String(
            notification.title || ''
          )
          .toLowerCase()
          .includes(search)

          ||

          String(
            notification.message || ''
          )
          .toLowerCase()
          .includes(search)

          ||

          String(
            notification.notification_type || ''
          )
          .toLowerCase()
          .includes(search);


        const matchesStatus =
          !this.statusFilter ||

          notification.status ===
          this.statusFilter;


        return (
          matchesSearch &&
          matchesStatus
        );

      }
    );

  }


  // ===============================
  // UNREAD COUNT
  // ===============================

  get unreadCount(): number {

    return this.notifications.filter(
      notification =>
        notification.status === 'Unread'
    ).length;

  }


  // ===============================
  // MARK AS READ
  // ===============================

  markAsRead(
    notificationId: number
  ): void {

    this.errorMessage = '';

    this.successMessage = '';


    this.notificationsService
      .markAsRead(notificationId)
      .subscribe({

        next: (data: any) => {

          console.log(
            'Notification marked as read:',
            data
          );

          this.successMessage =
            'Notification marked as read successfully.';

          this.loadNotifications();

        },

        error: (error: any) => {

          console.error(
            'Error marking notification as read:',
            error
          );

          this.errorMessage =
            error.error?.detail ||
            'Unable to mark notification as read.';

        }

      });

  }


  // ===============================
  // MARK ALL AS READ
  // ===============================

  markAllAsRead(): void {

    this.errorMessage = '';

    this.successMessage = '';


    this.notificationsService
      .markAllAsRead()
      .subscribe({

        next: (data: any) => {

          console.log(
            'All notifications marked as read:',
            data
          );

          this.successMessage =
            'All notifications marked as read.';

          this.loadNotifications();

        },

        error: (error: any) => {

          console.error(
            'Error marking all as read:',
            error
          );

          this.errorMessage =
            error.error?.detail ||
            'Unable to mark all notifications as read.';

        }

      });

  }


  // ===============================
  // REFRESH
  // ===============================

  refreshNotifications(): void {

    this.successMessage = '';

    this.errorMessage = '';

    this.loadNotifications();

  }

}