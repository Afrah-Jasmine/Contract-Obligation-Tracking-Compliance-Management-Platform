import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';

import { forkJoin } from 'rxjs';

import {
  Reports as ReportsService,
  ContractReport,
  ContractReportItem,
  ObligationReport,
  ObligationReportItem,
  RenewalReport,
  RenewalReportItem,
  ComplianceReport,
  ComplianceReportItem,
  AuditReport
} from '../../services/reports';

import {
  Dashboard as DashboardService,
  ContractSummary,
  ObligationSummary,
  RenewalSummary,
  ComplianceSummary
} from '../../services/dashboard';

import { Chart, registerables } from 'chart.js';

import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

Chart.register(...registerables);

type ReportType =
  | 'All'
  | 'Contracts'
  | 'Obligations'
  | 'Renewals'
  | 'Compliance'
  | 'Audit';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  templateUrl: './reports.html',
  styleUrl: './reports.css'
})
export class Reports implements OnInit, AfterViewInit, OnDestroy {

  // =========================================================
  // Backend reports
  // =========================================================

  contractReport: ContractReport | null = null;
  obligationReport: ObligationReport | null = null;
  renewalReport: RenewalReport | null = null;
  complianceReport: ComplianceReport | null = null;
  auditReport: AuditReport | null = null;

  // =========================================================
  // Analytics summaries
  // =========================================================

  contractSummary: ContractSummary | null = null;
  obligationSummary: ObligationSummary | null = null;
  renewalSummary: RenewalSummary | null = null;
  complianceSummary: ComplianceSummary | null = null;

  // =========================================================
  // Filtered data
  // =========================================================

  filteredContracts: ContractReportItem[] = [];
  filteredObligations: ObligationReportItem[] = [];
  filteredRenewals: RenewalReportItem[] = [];
  filteredCompliance: ComplianceReportItem[] = [];

  // =========================================================
  // Filters
  // =========================================================

  selectedReportType: ReportType = 'All';
  selectedStatus = 'All';
  searchTerm = '';
  fromDate = '';
  toDate = '';

  readonly reportTypes: ReportType[] = [
    'All',
    'Contracts',
    'Obligations',
    'Renewals',
    'Compliance',
    'Audit'
  ];

  readonly statusOptions = [
    'All',
    'Draft',
    'Under Review',
    'Approved',
    'Active',
    'Expired',
    'Terminated',
    'Pending',
    'In Progress',
    'Completed',
    'Delayed',
    'Overdue',
    'Upcoming',
    'Renewed',
    'Cancelled',
    'Compliant',
    'Non-Compliant',
    'High Risk'
  ];

  // =========================================================
  // State
  // =========================================================

  loading = false;
  errorMessage = '';

  private charts: Chart[] = [];
  private viewReady = false;

  constructor(
    private reportsService: ReportsService,
    private dashboardService: DashboardService,
    private cdr: ChangeDetectorRef
  ) {}

  // =========================================================
  // Lifecycle
  // =========================================================

  ngOnInit(): void {
    this.loadReports();
  }

  ngAfterViewInit(): void {
    this.viewReady = true;

    setTimeout(() => {
      this.renderCharts();
    });
  }

  ngOnDestroy(): void {
    this.destroyCharts();
  }

  // =========================================================
  // Load all backend data
  // =========================================================

  loadReports(): void {
    this.loading = true;
    this.errorMessage = '';

    this.contractReport = null;
    this.obligationReport = null;
    this.renewalReport = null;
    this.complianceReport = null;
    this.auditReport = null;

    this.contractSummary = null;
    this.obligationSummary = null;
    this.renewalSummary = null;
    this.complianceSummary = null;

    this.filteredContracts = [];
    this.filteredObligations = [];
    this.filteredRenewals = [];
    this.filteredCompliance = [];

    this.destroyCharts();

    this.cdr.detectChanges();

    forkJoin({
      contractReport: this.reportsService.getContractReport(),
      obligationReport: this.reportsService.getObligationReport(),
      renewalReport: this.reportsService.getRenewalReport(),
      complianceReport: this.reportsService.getComplianceReport(),
      auditReport: this.reportsService.getAuditReport(),

      contractSummary: this.dashboardService.getContractSummary(),
      obligationSummary: this.dashboardService.getObligationSummary(),
      renewalSummary: this.dashboardService.getRenewalSummary(),
      complianceSummary: this.dashboardService.getComplianceSummary()
    }).subscribe({
      next: (result) => {

        console.log('Reports and analytics loaded successfully.');

        this.contractReport = result.contractReport;
        this.obligationReport = result.obligationReport;
        this.renewalReport = result.renewalReport;
        this.complianceReport = result.complianceReport;
        this.auditReport = result.auditReport;

        this.contractSummary = result.contractSummary;
        this.obligationSummary = result.obligationSummary;
        this.renewalSummary = result.renewalSummary;
        this.complianceSummary = result.complianceSummary;

        this.loading = false;

        this.applyFilters();

        this.cdr.detectChanges();

        setTimeout(() => {
          this.renderCharts();
        });
      },

      error: (error) => {
        this.handleError(error);
      }
    });
  }

  // =========================================================
  // Filters
  // =========================================================

  applyFilters(): void {

    this.filteredContracts = this.filterContracts(
      this.contractReport?.data ?? []
    );

    this.filteredObligations = this.filterObligations(
      this.obligationReport?.data ?? []
    );

    this.filteredRenewals = this.filterRenewals(
      this.renewalReport?.data ?? []
    );

    this.filteredCompliance = this.filterCompliance(
      this.complianceReport?.data ?? []
    );

    this.cdr.detectChanges();

    setTimeout(() => {
      this.renderCharts();
    });
  }

  clearFilters(): void {
    this.selectedReportType = 'All';
    this.selectedStatus = 'All';
    this.searchTerm = '';
    this.fromDate = '';
    this.toDate = '';

    this.applyFilters();
  }

  onReportTypeChange(): void {
    this.applyFilters();
  }

  onStatusChange(): void {
    this.applyFilters();
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onFromDateChange(): void {
    this.applyFilters();
  }

  onToDateChange(): void {
    this.applyFilters();
  }

  // =========================================================
  // Contract filtering
  // =========================================================

  private filterContracts(
    records: ContractReportItem[]
  ): ContractReportItem[] {

    if (this.selectedReportType !== 'All' &&
        this.selectedReportType !== 'Contracts') {
      return [];
    }

    return records.filter((record) => {

      const search = this.searchTerm.trim().toLowerCase();

      const matchesSearch =
        !search ||
        record.contract_number?.toLowerCase().includes(search) ||
        record.title?.toLowerCase().includes(search) ||
        record.category?.toLowerCase().includes(search) ||
        record.status?.toLowerCase().includes(search) ||
        record.assigned_user?.toLowerCase().includes(search);

      const matchesStatus =
        this.selectedStatus === 'All' ||
        record.status === this.selectedStatus;

      const matchesDate =
        this.matchesDateRange(
          record.start_date,
          record.end_date
        );

      return matchesSearch && matchesStatus && matchesDate;
    });
  }

  // =========================================================
  // Obligation filtering
  // =========================================================

  private filterObligations(
    records: ObligationReportItem[]
  ): ObligationReportItem[] {

    if (this.selectedReportType !== 'All' &&
        this.selectedReportType !== 'Obligations') {
      return [];
    }

    return records.filter((record) => {

      const search = this.searchTerm.trim().toLowerCase();

      const matchesSearch =
        !search ||
        record.contract_number?.toLowerCase().includes(search) ||
        record.title?.toLowerCase().includes(search) ||
        record.obligation_type?.toLowerCase().includes(search) ||
        record.status?.toLowerCase().includes(search) ||
        record.assigned_user?.toLowerCase().includes(search);

      const matchesStatus =
        this.selectedStatus === 'All' ||
        record.status === this.selectedStatus;

      const matchesDate =
        this.matchesDateRange(
          record.due_date,
          record.completion_date
        );

      return matchesSearch && matchesStatus && matchesDate;
    });
  }

  // =========================================================
  // Renewal filtering
  // =========================================================

  private filterRenewals(
    records: RenewalReportItem[]
  ): RenewalReportItem[] {

    if (this.selectedReportType !== 'All' &&
        this.selectedReportType !== 'Renewals') {
      return [];
    }

    return records.filter((record) => {

      const search = this.searchTerm.trim().toLowerCase();

      const matchesSearch =
        !search ||
        record.contract_number?.toLowerCase().includes(search) ||
        record.status?.toLowerCase().includes(search) ||
        record.assigned_user?.toLowerCase().includes(search);

      const matchesStatus =
        this.selectedStatus === 'All' ||
        record.status === this.selectedStatus;

      const matchesDate =
        this.matchesDateRange(
          record.previous_expiry_date,
          record.new_expiry_date
        );

      return matchesSearch && matchesStatus && matchesDate;
    });
  }

  // =========================================================
  // Compliance filtering
  // =========================================================

  private filterCompliance(
    records: ComplianceReportItem[]
  ): ComplianceReportItem[] {

    if (this.selectedReportType !== 'All' &&
        this.selectedReportType !== 'Compliance') {
      return [];
    }

    return records.filter((record) => {

      const search = this.searchTerm.trim().toLowerCase();

      const matchesSearch =
        !search ||
        record.contract_number?.toLowerCase().includes(search) ||
        record.compliance_status?.toLowerCase().includes(search) ||
        record.risk_level?.toLowerCase().includes(search);

      const matchesStatus =
        this.selectedStatus === 'All' ||
        record.compliance_status === this.selectedStatus ||
        record.risk_level === this.selectedStatus;

      const matchesDate =
        this.matchesDateRange(
          record.evaluation_date,
          record.evaluation_date
        );

      return matchesSearch && matchesStatus && matchesDate;
    });
  }

  // =========================================================
  // Date filtering
  // =========================================================

  private matchesDateRange(
    firstDate: string | null | undefined,
    secondDate: string | null | undefined
  ): boolean {

    if (!this.fromDate && !this.toDate) {
      return true;
    }

    const dates = [firstDate, secondDate]
      .filter(Boolean)
      .map((date) => new Date(date as string).getTime())
      .filter((date) => !Number.isNaN(date));

    if (dates.length === 0) {
      return false;
    }

    const minimumDate = Math.min(...dates);
    const maximumDate = Math.max(...dates);

    if (this.fromDate) {
      const from = new Date(`${this.fromDate}T00:00:00`).getTime();

      if (maximumDate < from) {
        return false;
      }
    }

    if (this.toDate) {
      const to = new Date(`${this.toDate}T23:59:59`).getTime();

      if (minimumDate > to) {
        return false;
      }
    }

    return true;
  }

  // =========================================================
  // Filtered statistics
  // =========================================================

  get displayedContractCount(): number {
    return this.selectedReportType === 'All' ||
           this.selectedReportType === 'Contracts'
      ? this.filteredContracts.length
      : 0;
  }

  get displayedObligationCount(): number {
    return this.selectedReportType === 'All' ||
           this.selectedReportType === 'Obligations'
      ? this.filteredObligations.length
      : 0;
  }

  get displayedRenewalCount(): number {
    return this.selectedReportType === 'All' ||
           this.selectedReportType === 'Renewals'
      ? this.filteredRenewals.length
      : 0;
  }

  get displayedComplianceCount(): number {
    return this.selectedReportType === 'All' ||
           this.selectedReportType === 'Compliance'
      ? this.filteredCompliance.length
      : 0;
  }

  get filteredContractStatuses(): Record<string, number> {
    return this.countBy(
      this.filteredContracts.map((item) => item.status)
    );
  }

  get filteredObligationStatuses(): Record<string, number> {
    return this.countBy(
      this.filteredObligations.map((item) => item.status)
    );
  }

  get filteredRenewalStatuses(): Record<string, number> {
    return this.countBy(
      this.filteredRenewals.map((item) => item.status)
    );
  }

  get filteredComplianceStatuses(): Record<string, number> {
    return this.countBy(
      this.filteredCompliance.map((item) => item.compliance_status)
    );
  }

  private countBy(values: (string | null | undefined)[]): Record<string, number> {
    const result: Record<string, number> = {};

    values.forEach((value) => {
      if (!value) {
        return;
      }

      result[value] = (result[value] ?? 0) + 1;
    });

    return result;
  }

  // =========================================================
  // Charts
  // =========================================================

  private renderCharts(): void {

    if (!this.viewReady) {
      return;
    }

    this.destroyCharts();

    this.createContractChart();
    this.createObligationChart();
    this.createRenewalChart();
    this.createComplianceChart();
  }

  private createContractChart(): void {

    const canvas = document.getElementById(
      'reportsContractChart'
    ) as HTMLCanvasElement | null;

    if (!canvas) {
      return;
    }

    const data = this.filteredContractStatuses;

    this.charts.push(
      new Chart(canvas, {
        type: 'doughnut',
        data: {
          labels: Object.keys(data),
          datasets: [
            {
              data: Object.values(data)
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom'
            }
          }
        }
      })
    );
  }

  private createObligationChart(): void {

    const canvas = document.getElementById(
      'reportsObligationChart'
    ) as HTMLCanvasElement | null;

    if (!canvas) {
      return;
    }

    const data = this.filteredObligationStatuses;

    this.charts.push(
      new Chart(canvas, {
        type: 'bar',
        data: {
          labels: Object.keys(data),
          datasets: [
            {
              label: 'Obligations',
              data: Object.values(data)
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                precision: 0
              }
            }
          }
        }
      })
    );
  }

  private createRenewalChart(): void {

    const canvas = document.getElementById(
      'reportsRenewalChart'
    ) as HTMLCanvasElement | null;

    if (!canvas) {
      return;
    }

    const data = this.filteredRenewalStatuses;

    this.charts.push(
      new Chart(canvas, {
        type: 'doughnut',
        data: {
          labels: Object.keys(data),
          datasets: [
            {
              data: Object.values(data)
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom'
            }
          }
        }
      })
    );
  }

  private createComplianceChart(): void {

    const canvas = document.getElementById(
      'reportsComplianceChart'
    ) as HTMLCanvasElement | null;

    if (!canvas) {
      return;
    }

    const data = this.filteredComplianceStatuses;

    this.charts.push(
      new Chart(canvas, {
        type: 'doughnut',
        data: {
          labels: Object.keys(data),
          datasets: [
            {
              data: Object.values(data)
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom'
            }
          }
        }
      })
    );
  }

  private destroyCharts(): void {

    this.charts.forEach((chart) => {
      chart.destroy();
    });

    this.charts = [];
  }

  // =========================================================
  // Report visibility
  // =========================================================

  get showContracts(): boolean {
    return this.selectedReportType === 'All' ||
           this.selectedReportType === 'Contracts';
  }

  get showObligations(): boolean {
    return this.selectedReportType === 'All' ||
           this.selectedReportType === 'Obligations';
  }

  get showRenewals(): boolean {
    return this.selectedReportType === 'All' ||
           this.selectedReportType === 'Renewals';
  }

  get showCompliance(): boolean {
    return this.selectedReportType === 'All' ||
           this.selectedReportType === 'Compliance';
  }

  get showAudit(): boolean {
    return this.selectedReportType === 'All' ||
           this.selectedReportType === 'Audit';
  }

  // =========================================================
  // Download methods
  // =========================================================

  downloadContractPdf(): void {
    this.reportsService.downloadContractPdf().subscribe({
      next: (file) => this.saveFile(file, 'contract_report.pdf'),
      error: (error) => this.handleError(error)
    });
  }

  downloadContractExcel(): void {
    this.reportsService.downloadContractExcel().subscribe({
      next: (file) => this.saveFile(file, 'contract_report.xlsx'),
      error: (error) => this.handleError(error)
    });
  }

  downloadObligationPdf(): void {
    this.reportsService.downloadObligationPdf().subscribe({
      next: (file) => this.saveFile(file, 'obligation_report.pdf'),
      error: (error) => this.handleError(error)
    });
  }

  downloadObligationExcel(): void {
    this.reportsService.downloadObligationExcel().subscribe({
      next: (file) => this.saveFile(file, 'obligation_report.xlsx'),
      error: (error) => this.handleError(error)
    });
  }

  downloadRenewalPdf(): void {
    this.reportsService.downloadRenewalPdf().subscribe({
      next: (file) => this.saveFile(file, 'renewal_report.pdf'),
      error: (error) => this.handleError(error)
    });
  }

  downloadRenewalExcel(): void {
    this.reportsService.downloadRenewalExcel().subscribe({
      next: (file) => this.saveFile(file, 'renewal_report.xlsx'),
      error: (error) => this.handleError(error)
    });
  }

  downloadCompliancePdf(): void {
    this.reportsService.downloadCompliancePdf().subscribe({
      next: (file) => this.saveFile(file, 'compliance_report.pdf'),
      error: (error) => this.handleError(error)
    });
  }

  downloadComplianceExcel(): void {
    this.reportsService.downloadComplianceExcel().subscribe({
      next: (file) => this.saveFile(file, 'compliance_report.xlsx'),
      error: (error) => this.handleError(error)
    });
  }

  downloadAuditPdf(): void {
    this.reportsService.downloadAuditPdf().subscribe({
      next: (file) => this.saveFile(file, 'audit_report.pdf'),
      error: (error) => this.handleError(error)
    });
  }

  downloadAuditExcel(): void {
    this.reportsService.downloadAuditExcel().subscribe({
      next: (file) => this.saveFile(file, 'audit_report.xlsx'),
      error: (error) => this.handleError(error)
    });
  }

  // =========================================================
  // Helpers
  // =========================================================

  formatDate(value: string | null | undefined): string {

    if (!value) {
      return '-';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString();
  }

  private handleError(error: any): void {

    console.error('Reports API error:', error);

    this.loading = false;

    if (error.status === 401) {
      this.errorMessage =
        'Your session has expired. Please login again.';
    } else if (error.status === 403) {
      this.errorMessage =
        'You do not have permission to view reports.';
    } else {
      this.errorMessage =
        'Unable to load reports and analytics.';
    }

    this.cdr.detectChanges();
  }

  private saveFile(file: Blob, fileName: string): void {

    const url = window.URL.createObjectURL(file);
    const link = document.createElement('a');

    link.href = url;
    link.download = fileName;

    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(url);
  }
}
