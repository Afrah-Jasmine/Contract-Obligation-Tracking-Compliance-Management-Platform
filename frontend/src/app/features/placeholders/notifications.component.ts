import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-notifications-page',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  template: `
    <div class="page-container">
      <mat-card class="p-6">
        <div class="flex items-center gap-3 mb-4">
          <mat-icon class="text-amber-600 text-3xl">notifications</mat-icon>
          <h1 class="text-2xl font-bold m-0">Notifications & Alert Center</h1>
        </div>
        <p class="text-slate-600">Real-time automated alerts for overdue obligations, approaching renewals, and compliance warnings.</p>
      </mat-card>
    </div>
  `
})
export class NotificationsComponent {}
