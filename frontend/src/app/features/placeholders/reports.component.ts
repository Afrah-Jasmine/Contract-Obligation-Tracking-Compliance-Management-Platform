import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { DashboardService } from '../../core/services/dashboard.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-reports-page',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule],
  template: `
    <div class="page-container">
      <mat-card class="p-6">
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center gap-3">
            <mat-icon class="text-blue-600 text-3xl">bar_chart</mat-icon>
            <h1 class="text-2xl font-bold m-0">Reports & Export Center</h1>
          </div>
        </div>

        <p class="text-slate-600 mb-6">Generate and download PDF & Excel report files directly from FastAPI reporting services.</p>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <mat-card class="p-4 border border-slate-200">
            <h3 class="font-bold mb-2">Contract Reports</h3>
            <p class="text-xs text-slate-500 mb-4">Complete list of contracts with status and assigned users.</p>
            <div class="flex gap-2">
              <button mat-raised-button color="primary" (click)="export('contracts', 'pdf')">PDF</button>
              <button mat-stroked-button (click)="export('contracts', 'excel')">Excel</button>
            </div>
          </mat-card>

          <mat-card class="p-4 border border-slate-200">
            <h3 class="font-bold mb-2">Obligation Reports</h3>
            <p class="text-xs text-slate-500 mb-4">Detailed tracking report for all contractual obligations.</p>
            <div class="flex gap-2">
              <button mat-raised-button color="primary" (click)="export('obligations', 'pdf')">PDF</button>
              <button mat-stroked-button (click)="export('obligations', 'excel')">Excel</button>
            </div>
          </mat-card>

          <mat-card class="p-4 border border-slate-200">
            <h3 class="font-bold mb-2">Renewal Reports</h3>
            <p class="text-xs text-slate-500 mb-4">Summary report of contract renewals and expiry dates.</p>
            <div class="flex gap-2">
              <button mat-raised-button color="primary" (click)="export('renewals', 'pdf')">PDF</button>
              <button mat-stroked-button (click)="export('renewals', 'excel')">Excel</button>
            </div>
          </mat-card>

          <mat-card class="p-4 border border-slate-200">
            <h3 class="font-bold mb-2">Compliance Reports</h3>
            <p class="text-xs text-slate-500 mb-4">Compliance scores, risk levels, and evaluation snapshots.</p>
            <div class="flex gap-2">
              <button mat-raised-button color="primary" (click)="export('compliance', 'pdf')">PDF</button>
              <button mat-stroked-button (click)="export('compliance', 'excel')">Excel</button>
            </div>
          </mat-card>
        </div>
      </mat-card>
    </div>
  `
})
export class ReportsComponent {
  constructor(
    private dashboardService: DashboardService,
    private notificationService: NotificationService
  ) {}

  export(type: 'contracts' | 'obligations' | 'renewals' | 'compliance', format: 'pdf' | 'excel'): void {
    if (format === 'pdf') {
      this.dashboardService.downloadPdfReport(type).subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `ContractIQ_${type}_report.pdf`;
          a.click();
          this.notificationService.showSuccess(`Downloaded ${type} PDF report.`);
        }
      });
    } else {
      this.dashboardService.downloadExcelReport(type).subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `ContractIQ_${type}_report.xlsx`;
          a.click();
          this.notificationService.showSuccess(`Downloaded ${type} Excel report.`);
        }
      });
    }
  }
}
