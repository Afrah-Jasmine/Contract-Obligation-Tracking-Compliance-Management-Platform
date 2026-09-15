import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportService } from '../../core/services/report.service';
import {
  ContractSummaryResponse,
  ObligationSummaryResponse,
  RenewalSummaryResponse,
  ComplianceReportSummaryResponse
} from '../../core/models/report.model';

@Component({
  selector: 'app-reports',
  imports: [CommonModule, FormsModule],
  templateUrl: './reports.html',
  styleUrl: './reports.css'
})
export class Reports implements OnInit {

  activeTab: 'CONTRACTS' | 'OBLIGATIONS' | 'RENEWALS' | 'COMPLIANCE' = 'CONTRACTS';
  loading = signal<boolean>(true);
  error = signal<string>('');

  // Report Data States
  contractReport = signal<ContractSummaryResponse | null>(null);
  obligationReport = signal<ObligationSummaryResponse | null>(null);
  renewalReport = signal<RenewalSummaryResponse | null>(null);
  complianceReport = signal<ComplianceReportSummaryResponse | null>(null);

  // Renewal Filters
  renewalDays = 90;

  constructor(private reportService: ReportService) {}

  ngOnInit(): void {
    this.loadActiveReport();
  }

  setTab(tab: 'CONTRACTS' | 'OBLIGATIONS' | 'RENEWALS' | 'COMPLIANCE'): void {
    this.activeTab = tab;
    this.loadActiveReport();
  }

  loadActiveReport(): void {
    this.loading.set(true);
    this.error.set('');

    switch (this.activeTab) {
      case 'CONTRACTS':
        this.reportService.getContractSummary().subscribe({
          next: (data) => {
            this.contractReport.set(data);
            this.loading.set(false);
          },
          error: (err) => this.handleError(err)
        });
        break;

      case 'OBLIGATIONS':
        this.reportService.getObligationSummary().subscribe({
          next: (data) => {
            this.obligationReport.set(data);
            this.loading.set(false);
          },
          error: (err) => this.handleError(err)
        });
        break;

      case 'RENEWALS':
        this.reportService.getRenewalSummary(this.renewalDays).subscribe({
          next: (data) => {
            this.renewalReport.set(data);
            this.loading.set(false);
          },
          error: (err) => this.handleError(err)
        });
        break;

      case 'COMPLIANCE':
        this.reportService.getComplianceSummary().subscribe({
          next: (data) => {
            this.complianceReport.set(data);
            this.loading.set(false);
          },
          error: (err) => this.handleError(err)
        });
        break;
    }
  }

  exportPDF(): void {
    window.print();
  }

  exportExcel(): void {
    let csvData = 'Metric,Value\n';
    if (this.activeTab === 'CONTRACTS' && this.contractReport()) {
      const data = this.contractReport()!;
      csvData += `Total Contracts,${data.total_contracts}\nActive Contracts,${data.active_contracts}\nExpired Contracts,${data.expired_contracts}\nPending Approval,${data.pending_approval}\n`;
    } else if (this.activeTab === 'OBLIGATIONS' && this.obligationReport()) {
      const data = this.obligationReport()!;
      csvData += `Total Obligations,${data.total_obligations}\nPending Obligations,${data.pending_obligations}\nCompleted Obligations,${data.completed_obligations}\nOverdue Obligations,${data.overdue_obligations}\n`;
    } else if (this.activeTab === 'RENEWALS' && this.renewalReport()) {
      const data = this.renewalReport()!;
      csvData += `Upcoming Renewals,${data.upcoming_renewals}\nExpired Contracts,${data.expired_contracts}\nImmediate Attention,${data.immediate_attention}\n`;
    } else if (this.activeTab === 'COMPLIANCE' && this.complianceReport()) {
      const data = this.complianceReport()!;
      csvData += `Overall Compliance Percentage,${data.overall_compliance_percentage}%\nCompliant Contracts,${data.compliant_contracts}\nPartially Compliant,${data.partially_compliant_contracts}\nHigh Risk Contracts,${data.high_risk_contracts}\n`;
    }

    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `ContractIQ_Report_${this.activeTab}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  }

  private handleError(err: any): void {
    console.error('Report API Error:', err);
    this.error.set(err?.error?.detail || 'Failed to generate report.');
    this.loading.set(false);
  }
}
