import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../services/api';

@Component({
  selector: 'app-compliance',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './compliance.html',
  styleUrl: './compliance.css'
})
export class Compliance implements OnInit {

  contracts: any[] = [];
  loading = true;
  error = '';

  constructor(
    private api: ApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCompliance();
  }

  loadCompliance(): void {
    this.loading = true;
    this.error = '';

    this.api.getContracts().subscribe({
      next: (data: any) => {

        console.log('Compliance contracts received:', data);

        this.contracts = [...data];

        this.loading = false;

        this.cdr.detectChanges();

        console.log('Compliance contracts:', this.contracts.length);
      },

      error: (err) => {

        console.error('Compliance API error:', err);

        this.error = err?.error?.detail || 'Unable to load compliance data.';
        this.loading = false;

        this.cdr.detectChanges();
      }
    });
  }

  getComplianceStatus(contract: any): string {

    if (contract.status === 'Expired' || contract.status === 'Terminated') {
      return 'At Risk';
    }

    if (contract.status === 'Active') {
      return 'Compliant';
    }

    if (contract.status === 'Approved') {
      return 'Under Monitoring';
    }

    return 'Pending';
  }

  getStatusClass(contract: any): string {

    const status = this.getComplianceStatus(contract);

    if (status === 'Compliant') {
      return 'compliant';
    }

    if (status === 'At Risk') {
      return 'risk';
    }

    if (status === 'Under Monitoring') {
      return 'monitoring';
    }

    return 'pending';
  }

  getCompliantCount(): number {
    return this.contracts.filter(
      contract => this.getComplianceStatus(contract) === 'Compliant'
    ).length;
  }

  getMonitoringCount(): number {
    return this.contracts.filter(
      contract => this.getComplianceStatus(contract) === 'Under Monitoring'
    ).length;
  }

  getRiskCount(): number {
    return this.contracts.filter(
      contract => this.getComplianceStatus(contract) === 'At Risk'
    ).length;
  }
}