import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../services/api';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications.html',
  styleUrl: './notifications.css'
})
export class Notifications implements OnInit {

  obligations: any[] = [];
  loading = true;
  error = '';

  constructor(
    private api: ApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.loading = true;
    this.error = '';

    this.api.getObligations().subscribe({
      next: (data: any) => {

        console.log('Notification data received:', data);

        this.obligations = [...data];

        this.loading = false;

        this.cdr.detectChanges();

        console.log('Notification count:', this.obligations.length);
      },

      error: (err) => {

        console.error('Notifications API error:', err);

        this.error =
          err?.error?.detail || 'Unable to load notifications.';

        this.loading = false;

        this.cdr.detectChanges();
      }
    });
  }

  getNotificationType(obligation: any): string {

    if (obligation.status === 'Overdue') {
      return 'Overdue';
    }

    if (obligation.status === 'Delayed') {
      return 'Delayed';
    }

    if (obligation.status === 'Pending') {
      return 'Pending';
    }

    if (obligation.status === 'In Progress') {
      return 'In Progress';
    }

    return 'Information';
  }

  getNotificationClass(obligation: any): string {

    if (obligation.status === 'Overdue') {
      return 'overdue';
    }

    if (obligation.status === 'Delayed') {
      return 'delayed';
    }

    if (obligation.status === 'Pending') {
      return 'pending';
    }

    if (obligation.status === 'In Progress') {
      return 'progress';
    }

    return 'info';
  }

  getNotificationMessage(obligation: any): string {

    if (obligation.status === 'Overdue') {
      return `Obligation "${obligation.title}" is overdue.`;
    }

    if (obligation.status === 'Delayed') {
      return `Obligation "${obligation.title}" has been delayed.`;
    }

    if (obligation.status === 'Pending') {
      return `Obligation "${obligation.title}" is pending.`;
    }

    if (obligation.status === 'In Progress') {
      return `Obligation "${obligation.title}" is currently in progress.`;
    }

    if (obligation.status === 'Completed') {
      return `Obligation "${obligation.title}" has been completed.`;
    }

    return `Update available for obligation "${obligation.title}".`;
  }

  getOverdueCount(): number {
    return this.obligations.filter(
      obligation => obligation.status === 'Overdue'
    ).length;
  }

  getDelayedCount(): number {
    return this.obligations.filter(
      obligation => obligation.status === 'Delayed'
    ).length;
  }

  getPendingCount(): number {
    return this.obligations.filter(
      obligation => obligation.status === 'Pending'
    ).length;
  }

  getInProgressCount(): number {
    return this.obligations.filter(
      obligation => obligation.status === 'In Progress'
    ).length;
  }
}