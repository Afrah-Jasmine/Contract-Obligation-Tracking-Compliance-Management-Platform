import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReportService } from '../../core/services/report.service';
import { DashboardResponse } from '../../core/models/report.model';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {

  dashboardData = signal<DashboardResponse | null>(null);
  loading = signal<boolean>(true);
  error = signal<string>('');

  constructor(private reportService: ReportService) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading.set(true);
    this.error.set('');

    this.reportService.getDashboardSummary().subscribe({
      next: (data) => {
        this.dashboardData.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Dashboard API Error:', err);
        this.error.set(err?.error?.detail || 'Unable to load dashboard data from backend server.');
        this.loading.set(false);
      }
    });
  }
}