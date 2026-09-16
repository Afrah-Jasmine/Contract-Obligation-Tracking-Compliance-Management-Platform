import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-contracts-page',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  template: `
    <div class="page-container">
      <mat-card class="p-6">
        <div class="flex items-center gap-3 mb-4">
          <mat-icon class="text-sky-600 text-3xl">description</mat-icon>
          <h1 class="text-2xl font-bold m-0">Contract Repository & Lifecycle Management</h1>
        </div>
        <p class="text-slate-600">Full contract listing, status workflows (Draft, Under Review, Approved, Active, Expired, Terminated), and assignment capabilities integrated with FastAPI backend.</p>
      </mat-card>
    </div>
  `
})
export class ContractsComponent {}
