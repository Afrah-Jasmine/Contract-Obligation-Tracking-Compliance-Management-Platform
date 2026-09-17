import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../services/api';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {

  users: any[] = [];
  totalUsers = 0;

  totalContracts = 0;
  activeContracts = 0;

  totalObligations = 0;
  completedObligations = 0;
  pendingObligations = 0;
  overdueObligations = 0;

  totalRenewals = 0;
  upcomingRenewals = 0;

  totalComplianceContracts = 0;
  compliantContracts = 0;
  pendingComplianceContracts = 0;
  delayedContracts = 0;
  nonCompliantContracts = 0;
  highRiskContracts = 0;

  constructor(
  private apiService: ApiService,
  private cdr: ChangeDetectorRef
  ) {} 

  ngOnInit(): void {
    this.loadUsers();
    this.loadDashboardSummary();
  }

  loadUsers(): void {
    this.apiService.getUsers().subscribe({
      next: (data: any) => {
        console.log('Users from backend:', data);

        if (Array.isArray(data)) {
          this.users = data;
        } else if (data?.users && Array.isArray(data.users)) {
          this.users = data.users;
        } else {
          this.users = [];
        }

        this.totalUsers = this.users.length;
      },

      error: (error) => {
        console.error('Error loading users:', error);
      }
    });
  }

  loadDashboardSummary(): void {
    this.apiService.getDashboardSummary().subscribe({
      next: (data: any) => {
        console.log('Dashboard summary from backend:', data);

        this.totalContracts = data?.contracts?.total ?? 0;
        this.activeContracts = data?.contracts?.active ?? 0;

        this.totalObligations = data?.obligations?.total ?? 0;
        this.completedObligations = data?.obligations?.completed ?? 0;
        this.pendingObligations = data?.obligations?.pending ?? 0;
        this.overdueObligations = data?.obligations?.overdue ?? 0;

        this.totalRenewals = data?.renewals?.total ?? 0;
        this.upcomingRenewals = data?.renewals?.upcoming ?? 0;

        this.totalComplianceContracts =
          data?.compliance?.total_contracts ?? 0;

        this.compliantContracts =
          data?.compliance?.compliant_contracts ?? 0;

        this.pendingComplianceContracts =
          data?.compliance?.pending_contracts ?? 0;

        this.delayedContracts =
          data?.compliance?.delayed_contracts ?? 0;

        this.nonCompliantContracts =
          data?.compliance?.non_compliant_contracts ?? 0;

        this.highRiskContracts =
          data?.compliance?.high_risk_contracts ?? 0;
        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error('Error loading dashboard summary:', error);
      }
    });
  }
}