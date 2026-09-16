import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-compliance-page',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  template: `
    <div class="page-container">
      <mat-card class="p-6">
        <div class="flex items-center gap-3 mb-4">
          <mat-icon class="text-emerald-600 text-3xl">gavel</mat-icon>
          <h1 class="text-2xl font-bold m-0">Compliance Monitoring & Risk Identification</h1>
        </div>
        <p class="text-slate-600">Automated compliance evaluation scoring, risk level assessments, and audit trail records.</p>
      </mat-card>
    </div>
  `
})
export class ComplianceComponent {}
