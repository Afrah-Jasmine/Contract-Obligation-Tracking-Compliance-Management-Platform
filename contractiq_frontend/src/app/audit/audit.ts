import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../services/api';

@Component({
  selector: 'app-audit',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './audit.html',
  styleUrl: './audit.css'
})
export class Audit implements OnInit {

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
    this.loadActivity();
  }

  loadActivity(): void {
    this.loading = true;
    this.error = '';

    let contractsLoaded = false;
    let obligationsLoaded = false;
    let renewalsLoaded = false;

    const checkComplete = () => {
      if (contractsLoaded && obligationsLoaded && renewalsLoaded) {
        this.loading = false;
        this.cdr.detectChanges();

        console.log('Audit / Activity data loaded');
      }
    };

    this.api.getContracts().subscribe({
      next: (data: any) => {
        this.contracts = [...data];
        contractsLoaded = true;
        checkComplete();
      },
      error: (err) => {
        console.error('Audit contracts error:', err);
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
        console.error('Audit obligations error:', err);
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
        console.error('Audit renewals error:', err);
        renewalsLoaded = true;
        checkComplete();
      }
    });
  }

  getTotalActivities(): number {
    return this.contracts.length +
           this.obligations.length +
           this.renewals.length;
  }

  getActiveContracts(): number {
    return this.contracts.filter(
      contract => contract.status === 'Active'
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

  getUpcomingRenewals(): number {
    return this.renewals.filter(
      renewal => renewal.status === 'Upcoming'
    ).length;
  }
}