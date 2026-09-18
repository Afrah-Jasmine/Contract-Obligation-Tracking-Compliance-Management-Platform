import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import {
  timeout,
  finalize
} from 'rxjs';

import {
  ComplianceService,
  ComplianceRecord
} from '../services/compliance';

@Component({
  selector: 'app-compliance',
  imports: [],
  templateUrl: './compliance.html',
  styleUrl: './compliance.css'
})
export class Compliance implements OnInit {

  complianceRecords: ComplianceRecord[] = [];

  loading = true;
  errorMessage = '';

  constructor(
    private complianceService: ComplianceService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCompliance();
  }

  loadCompliance(): void {
    this.loading = true;
    this.errorMessage = '';

    this.complianceService
      .getCompliance()
      .pipe(
        timeout(10000),

        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({

        next: (data) => {

          console.log(
            'COMPLIANCE RESPONSE:',
            data
          );

          this.complianceRecords =
            Array.isArray(data) ? data : [];

          this.loading = false;

          this.cdr.detectChanges();
        },

        error: (error) => {

          console.error(
            'COMPLIANCE ERROR:',
            error
          );

          this.loading = false;

          if (error.status === 401) {

            this.errorMessage =
              'You are not authorized to view compliance information.';

          } else if (error.status === 403) {

            this.errorMessage =
              'You do not have permission to view compliance information.';

          } else if (error.status === 0) {

            this.errorMessage =
              'Unable to connect to ContractIQ server.';

          } else if (error.name === 'TimeoutError') {

            this.errorMessage =
              'Compliance request timed out. Please try again.';

          } else {

            this.errorMessage =
              'Unable to load compliance information. Please try again.';
          }

          this.cdr.detectChanges();
        }
      });
  }
}