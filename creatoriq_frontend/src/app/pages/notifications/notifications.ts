import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  Notifications as NotificationsService,
  Notification
} from '../../services/notifications';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './notifications.html',
  styleUrl: './notifications.css'
})
export class Notifications implements OnInit {

  notifications: Notification[] = [];
  filteredNotifications: Notification[] = [];

  loading = false;
  loadingDetails = false;
  markingAllRead = false;

  errorMessage = '';
  detailsErrorMessage = '';
  actionMessage = '';

  searchTerm = '';
  selectedStatus = 'All';
  selectedType = 'All';

  selectedNotification: Notification | null = null;

  showDetails = false;

  readonly statusOptions: string[] = [
    'All',
    'Unread',
    'Read'
  ];

  constructor(
    private notificationsService: NotificationsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.loading = true;
    this.errorMessage = '';
    this.actionMessage = '';

    this.notificationsService.getNotifications().subscribe({
      next: (data: Notification[]) => {
        console.log('Notifications data received:', data);
        console.log('Notifications count:', data.length);

        this.notifications = data;
        this.applyFilters();

        this.loading = false;
        this.cdr.detectChanges();
      },

      error: (error: any) => {
        console.error('Notifications API error:', error);

        this.loading = false;

        if (error.status === 401) {
          this.errorMessage =
            'Your session has expired. Please log in again.';
        } else if (error.status === 403) {
          this.errorMessage =
            'You do not have permission to view notifications.';
        } else {
          this.errorMessage =
            'Unable to load notifications.';
        }

        this.cdr.detectChanges();
      }
    });
  }

  applyFilters(): void {
    const search = this.searchTerm.trim().toLowerCase();

    this.filteredNotifications = this.notifications.filter(
      (notification: Notification) => {

        const matchesSearch =
          !search ||
          notification.title.toLowerCase().includes(search) ||
          notification.message.toLowerCase().includes(search) ||
          notification.notification_type.toLowerCase().includes(search);

        const isRead = !!notification.read_at;

        const matchesStatus =
          this.selectedStatus === 'All' ||
          (this.selectedStatus === 'Read' && isRead) ||
          (this.selectedStatus === 'Unread' && !isRead);

        const matchesType =
          this.selectedType === 'All' ||
          notification.notification_type === this.selectedType;

        return matchesSearch && matchesStatus && matchesType;
      }
    );

    this.cdr.detectChanges();
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onStatusChange(): void {
    this.applyFilters();
  }

  onTypeChange(): void {
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = 'All';
    this.selectedType = 'All';

    this.applyFilters();
  }

  get notificationTypes(): string[] {
    const types = this.notifications
      .map((notification: Notification) => notification.notification_type)
      .filter((type: string) => !!type);

    return [...new Set(types)].sort();
  }

  get unreadCount(): number {
    return this.notifications.filter(
      (notification: Notification) => !notification.read_at
    ).length;
  }

  get readCount(): number {
    return this.notifications.filter(
      (notification: Notification) => !!notification.read_at
    ).length;
  }

  viewDetails(notification: Notification): void {
    this.selectedNotification = notification;
    this.detailsErrorMessage = '';
    this.loadingDetails = true;
    this.showDetails = true;

    this.notificationsService
      .getNotificationById(notification.id)
      .subscribe({
        next: (data: Notification) => {
          this.selectedNotification = data;
          this.loadingDetails = false;
          this.cdr.detectChanges();
        },

        error: (error: any) => {
          console.error('Notification details API error:', error);

          this.loadingDetails = false;

          if (error.status === 401) {
            this.detailsErrorMessage =
              'Your session has expired. Please log in again.';
          } else if (error.status === 403) {
            this.detailsErrorMessage =
              'You do not have permission to view this notification.';
          } else if (error.status === 404) {
            this.detailsErrorMessage =
              'Notification was not found.';
          } else {
            this.detailsErrorMessage =
              'Unable to load notification details.';
          }

          this.cdr.detectChanges();
        }
      });
  }

  closeDetails(): void {
    this.showDetails = false;
    this.selectedNotification = null;
    this.detailsErrorMessage = '';
  }

  markAsRead(notification: Notification): void {
    if (notification.read_at) {
      return;
    }

    this.actionMessage = '';

    this.notificationsService
      .markNotificationAsRead(notification.id)
      .subscribe({
        next: (updatedNotification: Notification) => {
          this.replaceNotification(updatedNotification);

          this.actionMessage =
            'Notification marked as read.';

          this.cdr.detectChanges();
        },

        error: (error: any) => {
          console.error('Mark notification as read API error:', error);

          if (error.status === 401) {
            this.actionMessage =
              'Your session has expired. Please log in again.';
          } else if (error.status === 403) {
            this.actionMessage =
              'You do not have permission to update this notification.';
          } else if (error.status === 404) {
            this.actionMessage =
              'Notification was not found.';
          } else {
            this.actionMessage =
              'Unable to mark notification as read.';
          }

          this.cdr.detectChanges();
        }
      });
  }

  markAllAsRead(): void {
    if (this.unreadCount === 0 || this.markingAllRead) {
      return;
    }

    this.markingAllRead = true;
    this.actionMessage = '';

    this.notificationsService
      .markAllNotificationsAsRead()
      .subscribe({
        next: () => {
          const readAt = new Date().toISOString();

          this.notifications = this.notifications.map(
            (notification: Notification) => ({
              ...notification,
              read_at: notification.read_at ?? readAt
            })
          );

          this.applyFilters();

          this.markingAllRead = false;
          this.actionMessage =
            'All notifications marked as read.';

          this.cdr.detectChanges();
        },

        error: (error: any) => {
          console.error('Mark all notifications as read API error:', error);

          this.markingAllRead = false;

          if (error.status === 401) {
            this.actionMessage =
              'Your session has expired. Please log in again.';
          } else if (error.status === 403) {
            this.actionMessage =
              'You do not have permission to update notifications.';
          } else {
            this.actionMessage =
              'Unable to mark all notifications as read.';
          }

          this.cdr.detectChanges();
        }
      });
  }

  replaceNotification(updatedNotification: Notification): void {
    this.notifications = this.notifications.map(
      (notification: Notification) =>
        notification.id === updatedNotification.id
          ? updatedNotification
          : notification
    );

    if (
      this.selectedNotification &&
      this.selectedNotification.id === updatedNotification.id
    ) {
      this.selectedNotification = updatedNotification;
    }

    this.applyFilters();
  }

  getStatusClass(notification: Notification): string {
    return notification.read_at
      ? 'status-read'
      : 'status-unread';
  }

  getNotificationIcon(type: string): string {
    const normalizedType = type.toLowerCase();

    if (normalizedType.includes('renew')) {
      return '↻';
    }

    if (normalizedType.includes('obligation')) {
      return '✓';
    }

    if (normalizedType.includes('contract')) {
      return '▣';
    }

    if (normalizedType.includes('compliance')) {
      return '⚠';
    }

    return '🔔';
  }

  formatDateTime(value: string | null | undefined): string {
    if (!value) {
      return '-';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}