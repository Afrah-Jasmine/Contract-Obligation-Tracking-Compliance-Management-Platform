import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-obligations-page',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  template: `
    <div class="page-container">
      <mat-card class="p-6">
        <div class="flex items-center gap-3 mb-4">
          <mat-icon class="text-indigo-600 text-3xl">assignment</mat-icon>
          <h1 class="text-2xl font-bold m-0">Obligation Tracking & Task Management</h1>
        </div>
        <p class="text-slate-600">Track pending, in-progress, completed, delayed, and overdue obligations across assigned users.</p>
      </mat-card>
    </div>
  `
})
export class ObligationsComponent {}
