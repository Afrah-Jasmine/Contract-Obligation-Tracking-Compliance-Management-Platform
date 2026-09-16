import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-audit-page',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  template: `
    <div class="page-container">
      <mat-card class="p-6">
        <div class="flex items-center gap-3 mb-4">
          <mat-icon class="text-slate-700 text-3xl">history</mat-icon>
          <h1 class="text-2xl font-bold m-0">Audit & Activity Log History</h1>
        </div>
        <p class="text-slate-600">Historical audit trail log of system activities, compliance evaluations, and contract changes.</p>
      </mat-card>
    </div>
  `
})
export class AuditComponent {}
