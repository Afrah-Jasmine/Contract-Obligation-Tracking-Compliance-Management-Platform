import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { DatePipe } from '@angular/common';
import { timeout, finalize } from 'rxjs';

import {
  AuditService,
  AuditLog
} from '../services/audit';

@Component({
  selector: 'app-audit',
  imports: [DatePipe],
  templateUrl: './audit.html',
  styleUrl: './audit.css'
})
export class Audit implements OnInit {

  auditLogs: AuditLog[] = [];
  loading = true;
  errorMessage = '';

  constructor(
    private auditService: AuditService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadAuditLogs();
  }

  loadAuditLogs(): void {
    this.loading = true;
    this.errorMessage = '';

    this.auditService
      .getAuditLogs()
      .pipe(
        timeout(60000),
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (data) => {
          console.log('AUDIT RESPONSE:', data);

          this.auditLogs = Array.isArray(data) ? data : [];

          this.loading = false;
          this.cdr.detectChanges();
        },

        error: (error) => {
          console.error('AUDIT ERROR:', error);

          if (error.status === 401) {
            this.errorMessage =
              'You are not authorized to view audit history.';
          } else if (error.status === 403) {
            this.errorMessage =
              'You do not have permission to view audit history.';
          } else if (error.status === 0) {
            this.errorMessage =
              'Unable to connect to ContractIQ server.';
          } else {
            this.errorMessage =
              'Unable to load audit history. Please try again.';
          }

          this.loading = false;
          this.cdr.detectChanges();
        }
      });
  }
}