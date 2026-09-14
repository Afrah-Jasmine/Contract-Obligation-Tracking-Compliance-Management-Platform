import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';

import {
  Audit,
  AuditLog,
  Activity
} from '../../services/audit';

@Component({
  selector: 'app-audit-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './audit-history.html',
  styleUrl: './audit-history.css'
})
export class AuditHistory implements OnInit {

  auditLogs: AuditLog[] = [];
  activities: Activity[] = [];

  loading = true;
  errorMessage = '';

  activeTab: 'activities' | 'audit' = 'activities';

  constructor(
    private auditService: Audit,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadAuditHistory();
  }

  loadAuditHistory(): void {
    this.loading = true;
    this.errorMessage = '';

    this.auditService.getAuditActivityHistory().subscribe({
      next: (response) => {
        this.auditLogs = response.audit_logs ?? [];
        this.activities = response.activities ?? [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.loading = false;

        if (error.status === 401) {
          this.errorMessage =
            'Your session has expired. Please log in again.';
        } else if (error.status === 403) {
          this.errorMessage =
            'You do not have permission to view audit history.';
        } else {
          this.errorMessage =
            'Unable to load audit and activity history.';
        }

        this.cdr.detectChanges();
      }
    });
  }

  setActiveTab(
    tab: 'activities' | 'audit'
  ): void {
    this.activeTab = tab;
  }

  refresh(): void {
    this.loadAuditHistory();
  }

  get totalActivities(): number {
    return this.activities.length;
  }

  get totalAuditLogs(): number {
    return this.auditLogs.length;
  }

  get totalHistory(): number {
    return this.activities.length + this.auditLogs.length;
  }

  formatDateTime(value: string): string {
    if (!value) {
      return '-';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleString();
  }

  getActivityClass(
    activityType: string
  ): string {
    const type = activityType.toLowerCase();

    if (
      type.includes('created') ||
      type.includes('completed')
    ) {
      return 'success';
    }

    if (
      type.includes('updated') ||
      type.includes('assigned') ||
      type.includes('submitted')
    ) {
      return 'info';
    }

    if (
      type.includes('status') ||
      type.includes('changed')
    ) {
      return 'warning';
    }

    if (
      type.includes('deleted') ||
      type.includes('failed')
    ) {
      return 'danger';
    }

    return 'default';
  }

  getAuditClass(action: string): string {
    const type = action.toLowerCase();

    if (
      type.includes('created') ||
      type.includes('completed') ||
      type.includes('approved')
    ) {
      return 'success';
    }

    if (
      type.includes('updated') ||
      type.includes('assigned') ||
      type.includes('submitted')
    ) {
      return 'info';
    }

    if (
      type.includes('status') ||
      type.includes('changed')
    ) {
      return 'warning';
    }

    if (
      type.includes('deleted') ||
      type.includes('failed')
    ) {
      return 'danger';
    }

    return 'default';
  }

  getAuditDetails(log: AuditLog): string {
    if (!log.details) {
      return 'No additional details available.';
    }

    try {
      const parsed = JSON.parse(log.details);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return log.details;
    }
  }
}