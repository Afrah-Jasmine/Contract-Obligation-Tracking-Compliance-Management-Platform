import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { ComplianceService } from '../services/compliance.service';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-compliance-page',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './compliance-page.html',
  styleUrl: './compliance-page.css'
})
export class CompliancePage implements OnInit {

  // ===============================
  // COMPLIANCE DATA
  // ===============================

  complianceRecords: any[] = [];
  nonCompliantRecords: any[] = [];
  highRiskRecords: any[] = [];
selectedContractId: number | null = null;

complianceHistory: any[] = [];
complianceSummary: any = {
  total: 0,
  compliant: 0,
  pending: 0,
  delayed: 0,
  non_compliant: 0,
  high_risk: 0
};
  // ===============================
  // LOADING / MESSAGES
  // ===============================

  isLoading = false;

  errorMessage = '';

  successMessage = '';
  searchText = '';

statusFilter = '';

  // ===============================
  // CONSTRUCTOR
  // ===============================

  constructor(
    private complianceService: ComplianceService,
    private cdr: ChangeDetectorRef
  ) {}

  // ===============================
  // INITIALIZE
  // ===============================

  ngOnInit(): void {

    this.loadCompliance();

  }

  // ===============================
  // LOAD COMPLIANCE
  // ===============================

  loadCompliance(): void {

    this.isLoading = true;

    this.errorMessage = '';

    this.complianceService
      .getCompliance()
      .subscribe({

        next: (data: any[]) => {

          console.log(
            'Compliance Data:',
            data
          );

          this.complianceRecords = data;

          this.loadComplianceSummary();
          this.loadNonCompliant();
          this.loadHighRisk();


          this.isLoading = false;

          this.cdr.detectChanges();

        },

        error: (error: any) => {

          console.error(
            'Error loading compliance:',
            error
          );

          this.isLoading = false;

          if (error.status === 401) {

            this.errorMessage =
              'Session expired. Please login again.';

          }

          else if (error.status === 403) {

            this.errorMessage =
              'You do not have permission to view compliance.';

          }

          else {

            this.errorMessage =
              'Unable to load compliance data.';

          }

          this.cdr.detectChanges();

        }

      });

  }
  // ===============================
// LOAD COMPLIANCE SUMMARY
// ===============================

loadComplianceSummary(): void {

  this.complianceService
    .getComplianceSummary()
    .subscribe({

      next: (data: any) => {

        console.log(
          'Compliance Summary:',
          data
        );

        this.complianceSummary = data;

        this.cdr.detectChanges();

      },

      error: (error: any) => {

        console.error(
          'Error loading compliance summary:',
          error
        );

      }

    });

}
loadNonCompliant(): void {

  this.complianceService
    .getNonCompliant()
    .subscribe({

      next: (data: any[]) => {

        console.log('Non-Compliant:', data);

        this.nonCompliantRecords = data;

        this.cdr.detectChanges();

      },

      error: (error: any) => {

        console.error(
          'Error loading non-compliant:',
          error
        );

      }

    });

}
loadHighRisk(): void {

  this.complianceService
    .getHighRisk()
    .subscribe({

      next: (data: any[]) => {

        console.log(
          'High Risk Contracts:',
          data
        );

        this.highRiskRecords = data;

        this.cdr.detectChanges();

      },

      error: (error: any) => {

        console.error(
          'Error loading high risk contracts:',
          error
        );

      }

    });

}
loadComplianceHistory(contractId: number): void {

  this.selectedContractId = contractId;

  this.complianceService
    .getComplianceHistory(contractId)
    .subscribe({

      next: (data: any[]) => {

        console.log(
          'Compliance History:',
          data
        );

        this.complianceHistory = data;

        this.cdr.detectChanges();

      },

      error: (error: any) => {

        console.error(
          'Error loading compliance history:',
          error
        );

        this.complianceHistory = [];

      }

    });

}
// ===============================
// FILTERED COMPLIANCE
// ===============================

get filteredCompliance(): any[] {

  return this.complianceRecords.filter(
    (record: any) => {

      const search =
        this.searchText
          .toLowerCase()
          .trim();

      const matchesSearch =
        !search ||
        String(record.contract_id || '')
          .includes(search) ||
        String(record.status || '')
          .toLowerCase()
          .includes(search) ||
        String(record.risk_level || '')
          .toLowerCase()
          .includes(search);

      const matchesStatus =
        !this.statusFilter ||
        record.status === this.statusFilter;

      return matchesSearch && matchesStatus;

    }
  );

}
}