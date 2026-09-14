import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  Compliance as ComplianceService,
  Compliance as ComplianceRecord,
  ComplianceSummary,
  ContractCompliance,
  ComplianceHistory
} from '../../services/compliance';

@Component({
  selector: 'app-compliance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './compliance.html',
  styleUrl: './compliance.css'
})
export class Compliance implements OnInit {

  complianceRecords: ComplianceRecord[] = [];
  filteredRecords: ComplianceRecord[] = [];

  summary: ComplianceSummary | null = null;

  nonCompliantRecords: ComplianceRecord[] = [];
  highRiskRecords: ComplianceRecord[] = [];

  loading = false;
  loadingSummary = false;
  loadingRiskData = false;

  errorMessage = '';
  summaryErrorMessage = '';
  riskDataErrorMessage = '';

  searchTerm = '';
  selectedStatus = 'All';
  selectedRisk = 'All';

  readonly statusOptions = [
    'All',
    'Compliant',
    'Pending',
    'Delayed',
    'Non-Compliant',
    'High Risk'
  ];

  readonly riskOptions = [
    'All',
    'Low',
    'Medium',
    'High'
  ];

  showDetails = false;
  showHistory = false;

  selectedContract: ComplianceRecord | null = null;

  contractDetails: ContractCompliance | null = null;
  complianceHistory: ComplianceHistory[] = [];

  loadingDetails = false;
  loadingHistory = false;

  detailsErrorMessage = '';
  historyErrorMessage = '';

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

    this.loadingSummary = true;
    this.summaryErrorMessage = '';

    this.loadingRiskData = true;
    this.riskDataErrorMessage = '';

    this.cdr.detectChanges();

    this.complianceService.getCompliance().subscribe({
      next: (data) => {
        console.log('Compliance data received:', data);
        console.log('Compliance count:', data.length);

        this.complianceRecords = data;
        this.applyFilters();

        this.loading = false;

        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error('Compliance API error:', error);

        this.loading = false;

        if (error.status === 401) {
          this.errorMessage =
            'Your session has expired. Please log in again.';
        } else if (error.status === 403) {
          this.errorMessage =
            'You do not have permission to view compliance information.';
        } else {
          this.errorMessage =
            'Unable to load compliance information.';
        }

        this.cdr.detectChanges();
      }
    });

    this.loadSummary();
    this.loadRiskData();
  }

  loadSummary(): void {
    this.loadingSummary = true;
    this.summaryErrorMessage = '';

    this.complianceService.getComplianceSummary().subscribe({
      next: (data) => {
        this.summary = data;
        this.loadingSummary = false;

        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error('Compliance summary API error:', error);

        this.loadingSummary = false;

        if (error.status === 401) {
          this.summaryErrorMessage =
            'Your session has expired. Please log in again.';
        } else if (error.status === 403) {
          this.summaryErrorMessage =
            'You do not have permission to view compliance summary.';
        } else {
          this.summaryErrorMessage =
            'Unable to load compliance summary.';
        }

        this.cdr.detectChanges();
      }
    });
  }

  loadRiskData(): void {
    this.loadingRiskData = true;
    this.riskDataErrorMessage = '';

    let completedRequests = 0;

    const finishRequest = (): void => {
      completedRequests++;

      if (completedRequests === 2) {
        this.loadingRiskData = false;
        this.cdr.detectChanges();
      }
    };

    this.complianceService.getNonCompliant().subscribe({
      next: (data) => {
        this.nonCompliantRecords = data;
        finishRequest();
      },

      error: (error) => {
        console.error('Non-compliant API error:', error);

        if (error.status === 401) {
          this.riskDataErrorMessage =
            'Your session has expired. Please log in again.';
        } else if (error.status === 403) {
          this.riskDataErrorMessage =
            'You do not have permission to view risk information.';
        } else {
          this.riskDataErrorMessage =
            'Unable to load risk information.';
        }

        finishRequest();
      }
    });

    this.complianceService.getHighRisk().subscribe({
      next: (data) => {
        this.highRiskRecords = data;
        finishRequest();
      },

      error: (error) => {
        console.error('High-risk API error:', error);

        if (!this.riskDataErrorMessage) {
          if (error.status === 401) {
            this.riskDataErrorMessage =
              'Your session has expired. Please log in again.';
          } else if (error.status === 403) {
            this.riskDataErrorMessage =
              'You do not have permission to view risk information.';
          } else {
            this.riskDataErrorMessage =
              'Unable to load risk information.';
          }
        }

        finishRequest();
      }
    });
  }

  applyFilters(): void {
    const search = this.searchTerm.trim().toLowerCase();

    this.filteredRecords = this.complianceRecords.filter((record) => {

      const matchesSearch =
        !search ||
        record.contract_number.toLowerCase().includes(search);

      const matchesStatus =
        this.selectedStatus === 'All' ||
        record.compliance_status === this.selectedStatus;

      const matchesRisk =
        this.selectedRisk === 'All' ||
        record.risk_level === this.selectedRisk;

      return matchesSearch && matchesStatus && matchesRisk;
    });

    this.cdr.detectChanges();
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onStatusChange(): void {
    this.applyFilters();
  }

  onRiskChange(): void {
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = 'All';
    this.selectedRisk = 'All';

    this.applyFilters();
  }

  viewDetails(record: ComplianceRecord): void {
    this.selectedContract = record;
    this.contractDetails = null;
    this.detailsErrorMessage = '';
    this.loadingDetails = true;
    this.showDetails = true;

    this.complianceService
      .getContractCompliance(record.contract_id)
      .subscribe({
        next: (data) => {
          this.contractDetails = data;
          this.loadingDetails = false;

          this.cdr.detectChanges();
        },

        error: (error) => {
          console.error(
            'Contract compliance details API error:',
            error
          );

          this.loadingDetails = false;

          if (error.status === 401) {
            this.detailsErrorMessage =
              'Your session has expired. Please log in again.';
          } else if (error.status === 403) {
            this.detailsErrorMessage =
              'You do not have permission to view this contract compliance information.';
          } else if (error.status === 404) {
            this.detailsErrorMessage =
              'Contract compliance information was not found.';
          } else {
            this.detailsErrorMessage =
              'Unable to load contract compliance details.';
          }

          this.cdr.detectChanges();
        }
      });
  }

  closeDetails(): void {
    this.showDetails = false;
    this.selectedContract = null;
    this.contractDetails = null;
    this.detailsErrorMessage = '';
  }

  viewHistory(record: ComplianceRecord): void {
    this.selectedContract = record;
    this.complianceHistory = [];
    this.historyErrorMessage = '';
    this.loadingHistory = true;
    this.showHistory = true;

    this.complianceService
      .getComplianceHistory(record.contract_id)
      .subscribe({
        next: (data) => {
          this.complianceHistory = data;
          this.loadingHistory = false;

          this.cdr.detectChanges();
        },

        error: (error) => {
          console.error(
            'Compliance history API error:',
            error
          );

          this.loadingHistory = false;

          if (error.status === 401) {
            this.historyErrorMessage =
              'Your session has expired. Please log in again.';
          } else if (error.status === 403) {
            this.historyErrorMessage =
              'You do not have permission to view this compliance history.';
          } else if (error.status === 404) {
            this.historyErrorMessage =
              'Compliance history was not found.';
          } else {
            this.historyErrorMessage =
              'Unable to load compliance history.';
          }

          this.cdr.detectChanges();
        }
      });
  }

  closeHistory(): void {
    this.showHistory = false;
    this.selectedContract = null;
    this.complianceHistory = [];
    this.historyErrorMessage = '';
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Compliant':
        return 'status-compliant';

      case 'Pending':
        return 'status-pending';

      case 'Delayed':
        return 'status-delayed';

      case 'Non-Compliant':
        return 'status-non-compliant';

      case 'High Risk':
        return 'status-high-risk';

      default:
        return '';
    }
  }

  getRiskClass(risk: string): string {
    switch (risk) {
      case 'Low':
        return 'risk-low';

      case 'Medium':
        return 'risk-medium';

      case 'High':
        return 'risk-high';

      default:
        return '';
    }
  }

  getScoreClass(score: number): string {
    if (score >= 80) {
      return 'score-high';
    }

    if (score >= 50) {
      return 'score-medium';
    }

    return 'score-low';
  }

  formatDate(value: string | null | undefined): string {
    if (!value) {
      return '-';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
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
