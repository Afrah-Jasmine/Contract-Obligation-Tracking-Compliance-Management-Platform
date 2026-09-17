import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../services/api';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reports.html',
  styleUrl: './reports.css'
})
export class Reports implements OnInit {

  contracts: any[] = [];
  obligations: any[] = [];
  renewals: any[] = [];

  loading = true;
  error = '';

  constructor(
    private api: ApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadReports();
  }

  loadReports(): void {
    this.loading = true;
    this.error = '';

    let contractsLoaded = false;
    let obligationsLoaded = false;
    let renewalsLoaded = false;

    const checkComplete = () => {
      if (contractsLoaded && obligationsLoaded && renewalsLoaded) {
        this.loading = false;
        this.cdr.detectChanges();

        console.log('Reports loaded');
        console.log('Contracts:', this.contracts.length);
        console.log('Obligations:', this.obligations.length);
        console.log('Renewals:', this.renewals.length);
      }
    };

    this.api.getContracts().subscribe({
      next: (data: any) => {
        this.contracts = [...data];
        contractsLoaded = true;
        checkComplete();
      },
      error: (err) => {
        console.error('Contracts report error:', err);
        contractsLoaded = true;
        checkComplete();
      }
    });

    this.api.getObligations().subscribe({
      next: (data: any) => {
        this.obligations = [...data];
        obligationsLoaded = true;
        checkComplete();
      },
      error: (err) => {
        console.error('Obligations report error:', err);
        obligationsLoaded = true;
        checkComplete();
      }
    });

    this.api.getRenewals().subscribe({
      next: (data: any) => {
        this.renewals = [...data];
        renewalsLoaded = true;
        checkComplete();
      },
      error: (err) => {
        console.error('Renewals report error:', err);
        renewalsLoaded = true;
        checkComplete();
      }
    });
  }

  getActiveContracts(): number {
    return this.contracts.filter(
      contract => contract.status === 'Active'
    ).length;
  }

  getExpiredContracts(): number {
    return this.contracts.filter(
      contract => contract.status === 'Expired'
    ).length;
  }

  getPendingContracts(): number {
    return this.contracts.filter(
      contract =>
        contract.status === 'Draft' ||
        contract.status === 'Under Review'
    ).length;
  }

  getCompletedObligations(): number {
    return this.obligations.filter(
      obligation => obligation.status === 'Completed'
    ).length;
  }

  getOverdueObligations(): number {
    return this.obligations.filter(
      obligation => obligation.status === 'Overdue'
    ).length;
  }

  getPendingObligations(): number {
    return this.obligations.filter(
      obligation => obligation.status === 'Pending'
    ).length;
  }

  getUpcomingRenewals(): number {
    return this.renewals.filter(
      renewal => renewal.status === 'Upcoming'
    ).length;
  }

  getCompletedRenewals(): number {
    return this.renewals.filter(
      renewal => renewal.status === 'Completed'
    ).length;
  }

  getContractPercentage(status: string): number {
    if (this.contracts.length === 0) {
      return 0;
    }

    return Math.round(
      (this.contracts.filter(c => c.status === status).length /
        this.contracts.length) * 100
    );
  }

  getObligationPercentage(status: string): number {
    if (this.obligations.length === 0) {
      return 0;
    }

    return Math.round(
      (this.obligations.filter(o => o.status === status).length /
        this.obligations.length) * 100
    );
  }
}