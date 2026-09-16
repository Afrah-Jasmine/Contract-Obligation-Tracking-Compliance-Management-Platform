import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UserNotificationService, AppNotification } from '../../core/services/user-notification.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-notifications-page',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatListModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">Notification & Alert Center</h1>
          <p class="page-subtitle">Real-time alerts for overdue obligations, upcoming renewals, and compliance risks.</p>
        </div>
        <button mat-flat-button color="primary" (click)="markAllRead()" [disabled]="notifications.length === 0">
          <mat-icon>done_all</mat-icon>
          <span>Mark All as Read</span>
        </button>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading" class="flex justify-center p-12">
        <mat-spinner diameter="40"></mat-spinner>
      </div>

      <!-- Empty State -->
      <mat-card *ngIf="!isLoading && notifications.length === 0" class="p-8 text-center text-slate-500">
        <mat-icon class="text-5xl text-emerald-500">notifications_off</mat-icon>
        <h3 class="font-bold text-lg text-slate-700 mt-2">No unread notifications</h3>
        <p>You're all caught up! All contractual alerts have been acknowledged.</p>
      </mat-card>

      <!-- Notification List -->
      <mat-card *ngIf="!isLoading && notifications.length > 0">
        <mat-nav-list class="notif-list">
          <div *ngFor="let item of notifications" class="notif-item" [ngClass]="{'unread': item.status === 'Unread'}">
            <div class="notif-icon" [ngClass]="getIconClass(item.notification_type)">
              <mat-icon>{{ getIconName(item.notification_type) }}</mat-icon>
            </div>

            <div class="notif-content">
              <div class="flex items-center gap-2 mb-1">
                <span class="font-bold text-slate-900">{{ item.title }}</span>
                <span class="badge" [ngClass]="item.status === 'Unread' ? 'badge-high-risk' : 'badge-draft'">
                  {{ item.status }}
                </span>
              </div>
              <p class="notif-msg">{{ item.message }}</p>
              <span class="notif-time">{{ item.created_at }}</span>
            </div>

            <button mat-icon-button *ngIf="item.status === 'Unread'" (click)="markRead(item.id)" matTooltip="Mark as Read">
              <mat-icon color="primary">check_circle_outline</mat-icon>
            </button>
          </div>
        </mat-nav-list>
      </mat-card>
    </div>
  `,
  styles: [`
    .page-container { display: flex; flex-direction: column; gap: 16px; }
    .page-header { display: flex; justify-content: space-between; align-items: center; }
    .page-title { font-size: 1.5rem; font-weight: 800; margin: 0; }
    .page-subtitle { color: #64748b; font-size: 0.875rem; margin-top: 4px; }
    .notif-list { padding: 0; }
    .notif-item {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      padding: 16px;
      border-bottom: 1px solid #f1f5f9;
      &.unread { background-color: #f0f9ff; }
    }
    .notif-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .icon-renewal { background-color: #f3e8ff; color: #9333ea; }
    .icon-obligation { background-color: #ffe4e6; color: #e11d48; }
    .icon-compliance { background-color: #fef3c7; color: #d97706; }
    .notif-content { flex: 1; }
    .notif-msg { margin: 0; font-size: 0.875rem; color: #475569; }
    .notif-time { font-size: 0.75rem; color: #94a3b8; display: block; margin-top: 4px; }
    .p-8 { padding: 32px; }
  `]
})
export class NotificationsComponent implements OnInit {
  notifications: AppNotification[] = [];
  isLoading = true;

  constructor(
    private userNotifService: UserNotificationService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.isLoading = true;
    this.userNotifService.getNotifications().subscribe({
      next: (data) => {
        this.notifications = data || [];
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.notificationService.showError('Failed to fetch notifications.');
      }
    });
  }

  markRead(id: number): void {
    this.userNotifService.markAsRead(id).subscribe({
      next: () => {
        this.notificationService.showSuccess('Notification marked as read.');
        this.loadNotifications();
      }
    });
  }

  markAllRead(): void {
    this.userNotifService.markAllAsRead().subscribe({
      next: (res) => {
        this.notificationService.showSuccess(`Marked ${res.updated_count} notifications as read.`);
        this.loadNotifications();
      }
    });
  }

  getIconClass(type: string): string {
    if (type.includes('Renewal')) return 'icon-renewal';
    if (type.includes('Obligation')) return 'icon-obligation';
    return 'icon-compliance';
  }

  getIconName(type: string): string {
    if (type.includes('Renewal')) return 'autorenew';
    if (type.includes('Obligation')) return 'assignment_late';
    return 'warning';
  }
}
