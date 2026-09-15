import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../core/services/notification.service';
import { Notification } from '../../core/models/notification.model';

@Component({
  selector: 'app-notifications',
  imports: [CommonModule],
  templateUrl: './notifications.html',
  styleUrl: './notifications.css'
})
export class Notifications implements OnInit {

  notifications = signal<Notification[]>([]);
  filteredNotifications = signal<Notification[]>([]);
  loading = signal<boolean>(true);
  error = signal<string>('');

  activeTab: 'ALL' | 'UNREAD' | 'READ' = 'ALL';

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.loading.set(true);
    this.error.set('');

    this.notificationService.getNotifications().subscribe({
      next: (data) => {
        this.notifications.set(data);
        this.applyTabFilter();
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load notifications:', err);
        this.error.set(err?.error?.detail || 'Failed to load notifications inbox.');
        this.loading.set(false);
      }
    });
  }

  setTab(tab: 'ALL' | 'UNREAD' | 'READ'): void {
    this.activeTab = tab;
    this.applyTabFilter();
  }

  applyTabFilter(): void {
    let result = this.notifications();
    if (this.activeTab === 'UNREAD') {
      result = result.filter(n => n.status === 'Unread');
    } else if (this.activeTab === 'READ') {
      result = result.filter(n => n.status === 'Read');
    }
    this.filteredNotifications.set(result);
  }

  markAsRead(item: Notification): void {
    if (item.status === 'Read') return;

    this.notificationService.markAsRead(item.id).subscribe({
      next: () => this.loadNotifications(),
      error: (err) => alert(err?.error?.detail || 'Failed to update notification.')
    });
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe({
      next: () => this.loadNotifications(),
      error: (err) => alert(err?.error?.detail || 'Failed to mark notifications as read.')
    });
  }

  getNotificationBadgeClass(type: string): string {
    switch (type) {
      case 'Obligation Overdue': return 'badge-overdue';
      case 'Obligation Due': return 'badge-pending';
      case 'Renewal Reminder': return 'badge-approved';
      default: return 'badge-draft';
    }
  }
}
