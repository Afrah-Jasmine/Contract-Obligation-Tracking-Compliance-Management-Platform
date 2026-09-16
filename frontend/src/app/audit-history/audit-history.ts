import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { AuditHistoryService } from '../services/audit-history.service';

@Component({
  selector: 'app-audit-history',
  imports: [],
  templateUrl: './audit-history.html',
  styleUrl: './audit-history.css'
})
export class AuditHistory implements OnInit {

  auditLogs: any[] = [];

  isLoading = false;

  errorMessage = '';

  constructor(
    private auditHistoryService: AuditHistoryService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {

    console.log('Audit History Component Loaded');

    this.loadAuditLogs();

  }

  loadAuditLogs(): void {

    this.isLoading = true;

    this.errorMessage = '';

    this.auditHistoryService
      .getAuditLogs()
      .subscribe({

        next: (data: any[]) => {

          console.log('AUDIT LOG DATA:', data);

          this.auditLogs = data || [];

          this.isLoading = false;

          this.cdr.detectChanges();

        },

        error: (error: any) => {

          console.error(
            'Error loading audit logs:',
            error
          );

          this.isLoading = false;

          this.errorMessage =
            'Unable to load audit history.';

          this.cdr.detectChanges();

        }

      });

  }

}