import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComplianceService } from '../../core/services/compliance.service';
import { ContractService } from '../../core/services/contract.service';
import { ComplianceResponse, ComplianceSummary } from '../../core/models/compliance.model';
import { Contract } from '../../core/models/contract.model';

@Component({
  selector: 'app-compliance',
  imports: [CommonModule],
  templateUrl: './compliance.html',
  styleUrl: './compliance.css'
})
export class Compliance implements OnInit {

  complianceList = signal<ComplianceResponse[]>([]);
  summary = signal<ComplianceSummary | null>(null);
  contracts = signal<Contract[]>([]);

  loading = signal<boolean>(true);
  error = signal<string>('');

  activeFilter: 'ALL' | 'NON_COMPLIANT' | 'HIGH_RISK' = 'ALL';

  constructor(
    private complianceService: ComplianceService,
    private contractService: ContractService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.error.set('');

    // Fetch contracts map
    this.contractService.getContracts().subscribe({
      next: (data) => this.contracts.set(data)
    });

    // Fetch compliance summary stats
    this.complianceService.getComplianceSummary().subscribe({
      next: (data) => this.summary.set(data)
    });

    this.fetchFilteredCompliance();
  }

  fetchFilteredCompliance(): void {
    this.loading.set(true);

    if (this.activeFilter === 'NON_COMPLIANT') {
      this.complianceService.getNonCompliantContracts().subscribe({
        next: (data) => {
          this.complianceList.set(data);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(err?.error?.detail || 'Failed to load non-compliant contracts.');
          this.loading.set(false);
        }
      });
    } else if (this.activeFilter === 'HIGH_RISK') {
      this.complianceService.getHighRiskContracts().subscribe({
        next: (data) => {
          this.complianceList.set(data);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(err?.error?.detail || 'Failed to load high-risk contracts.');
          this.loading.set(false);
        }
      });
    } else {
      this.complianceService.getAllCompliance().subscribe({
        next: (data) => {
          this.complianceList.set(data);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(err?.error?.detail || 'Failed to load compliance audit results.');
          this.loading.set(false);
        }
      });
    }
  }

  setFilter(filter: 'ALL' | 'NON_COMPLIANT' | 'HIGH_RISK'): void {
    this.activeFilter = filter;
    this.fetchFilteredCompliance();
  }

  getContractTitle(contractId: number): string {
    const match = this.contracts().find(c => c.id === contractId);
    return match ? `${match.title} (${match.contract_number})` : `Contract #${contractId}`;
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'Compliant': return 'badge-completed';
      case 'Partially Compliant': return 'badge-pending';
      case 'Non-Compliant': return 'badge-overdue';
      default: return 'badge-draft';
    }
  }

  getRiskBadgeClass(risk: string): string {
    switch (risk) {
      case 'High': return 'badge-high';
      case 'Medium': return 'badge-medium';
      case 'Low': return 'badge-low';
      default: return 'badge-low';
    }
  }
}
