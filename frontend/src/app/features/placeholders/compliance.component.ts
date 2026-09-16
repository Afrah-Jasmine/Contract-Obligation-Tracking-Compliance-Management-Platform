import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ComplianceService, ComplianceRecordModel } from '../../core/services/compliance.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-compliance-page',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">Compliance & Risk Management</h1>
          <p class="page-subtitle">Evaluation scoring, audit snapshots, and risk level monitoring.</p>
        </div>
        <button mat-flat-button color="primary" (click)="loadComplianceData()">
          <mat-icon>refresh</mat-icon>
          <span>Refresh Compliance Evaluations</span>
        </button>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading" class="flex justify-center p-12">
        <mat-spinner diameter="40"></mat-spinner>
      </div>

      <!-- Compliance Cards -->
      <div *ngIf="!isLoading" class="records-grid">
        <mat-card *ngFor="let record of records" class="record-card">
          <div class="card-header-row">
            <div>
              <h3 class="contract-num">{{ record.contract_number || ('CNT-' + record.contract_id) }}</h3>
              <p class="contract-title">{{ record.title || 'Contract Obligations' }}</p>
            </div>
            <span class="badge" [ngClass]="getRiskBadgeClass(record.risk_level)">
              {{ record.risk_level }} Risk
            </span>
          </div>

          <div class="score-box my-3">
            <div class="flex justify-between text-xs font-semibold mb-1">
              <span>Compliance Score</span>
              <span class="font-bold text-slate-800">{{ record.compliance_score }}%</span>
            </div>
            <mat-progress-bar
              mode="determinate"
              [value]="record.compliance_score"
              [color]="record.compliance_score >= 80 ? 'primary' : 'warn'"
            ></mat-progress-bar>
          </div>

          <div class="metrics-row">
            <div class="metric">
              <span class="metric-val text-emerald-600">{{ record.completed_obligations || 0 }}</span>
              <span class="metric-lbl">Completed</span>
            </div>
            <div class="metric">
              <span class="metric-val text-slate-600">{{ record.pending_obligations || 0 }}</span>
              <span class="metric-lbl">Pending</span>
            </div>
            <div class="metric">
              <span class="metric-val text-rose-600 font-bold">{{ record.overdue_obligations || 0 }}</span>
              <span class="metric-lbl">Overdue</span>
            </div>
          </div>

          <div class="card-footer-row mt-3">
            <span class="text-xs text-slate-400">Status: <strong>{{ record.compliance_status }}</strong></span>
            <button mat-button color="primary" class="text-xs" (click)="evaluateContract(record.contract_id)">Re-evaluate</button>
          </div>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .page-container { display: flex; flex-direction: column; gap: 16px; }
    .page-header { display: flex; justify-content: space-between; align-items: center; }
    .page-title { font-size: 1.5rem; font-weight: 800; margin: 0; }
    .page-subtitle { color: #64748b; font-size: 0.875rem; margin-top: 4px; }
    .records-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 16px;
    }
    .record-card { padding: 16px; }
    .card-header-row { display: flex; justify-content: space-between; align-items: flex-start; }
    .contract-num { font-size: 1rem; font-weight: 800; margin: 0; color: #0f172a; }
    .contract-title { font-size: 0.8125rem; color: #64748b; margin: 2px 0 0 0; }
    .metrics-row { display: flex; justify-content: space-around; background-color: #f8fafc; padding: 8px; border-radius: 8px; text-align: center; }
    .metric-val { display: block; font-size: 1.125rem; font-weight: 700; }
    .metric-lbl { font-size: 0.7rem; color: #64748b; text-transform: uppercase; }
    .card-footer-row { display: flex; justify-content: space-between; align-items: center; }
    .my-3 { margin: 12px 0; }
    .mt-3 { margin-top: 12px; }
    .flex { display: flex; }
    .justify-between { justify-content: space-between; }
    .text-xs { font-size: 0.75rem; }
    .font-semibold { font-weight: 600; }
    .font-bold { font-weight: 700; }
    .mb-1 { margin-bottom: 4px; }
  `]
})
export class ComplianceComponent implements OnInit {
  records: ComplianceRecordModel[] = [];
  isLoading = true;

  constructor(
    private complianceService: ComplianceService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadComplianceData();
  }

  loadComplianceData(): void {
    this.isLoading = true;
    this.complianceService.getAllCompliance().subscribe({
      next: (data) => {
        this.records = data || [];
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.notificationService.showError('Failed to load compliance evaluations.');
      }
    });
  }

  evaluateContract(contractId: number): void {
    this.complianceService.getContractCompliance(contractId).subscribe({
      next: (res) => {
        this.notificationService.showSuccess(`Contract #${res.contract_id} evaluated! Score: ${res.compliance_score}%`);
        this.loadComplianceData();
      },
      error: () => this.notificationService.showError('Evaluation failed.')
    });
  }

  getRiskBadgeClass(riskLevel: string): string {
    switch (riskLevel) {
      case 'High': return 'badge-high-risk';
      case 'Medium': return 'badge-medium-risk';
      case 'Low': return 'badge-low-risk';
      default: return 'badge-low-risk';
    }
  }
}
