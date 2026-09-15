import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RenewalService } from '../../core/services/renewal.service';
import { ContractService } from '../../core/services/contract.service';
import { AuthService } from '../../core/services/auth';
import { Renewal, RenewalCreate, RenewalStatus } from '../../core/models/renewal.model';
import { Contract } from '../../core/models/contract.model';

@Component({
  selector: 'app-renewals',
  imports: [CommonModule, FormsModule],
  templateUrl: './renewals.html',
  styleUrl: './renewals.css'
})
export class Renewals implements OnInit {

  renewals = signal<Renewal[]>([]);
  filteredRenewals = signal<Renewal[]>([]);
  contracts = signal<Contract[]>([]);

  loading = signal<boolean>(true);
  error = signal<string>('');

  activeTab: 'ALL' | 'UPCOMING' | 'EXPIRED' = 'ALL';
  upcomingDays = 90;

  // Modal control states
  showCreateModal = false;
  showCompleteModal = false;
  selectedRenewal: Renewal | null = null;

  // Create Form Data
  newRenewal: RenewalCreate = {
    contract_id: 1,
    renewal_date: '',
    previous_expiry_date: '',
    new_expiry_date: '',
    notes: ''
  };

  // Complete Form Data
  completeRenewalDate = '';
  completeNewExpiryDate = '';

  createError = '';
  submitting = false;

  constructor(
    private renewalService: RenewalService,
    private contractService: ContractService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.error.set('');

    // Fetch contracts for dropdown selection
    this.contractService.getContracts().subscribe({
      next: (data) => {
        this.contracts.set(data);
        if (data.length > 0) {
          this.newRenewal.contract_id = data[0].id;
          this.newRenewal.previous_expiry_date = data[0].end_date;
        }
      }
    });

    this.fetchTabRenewals();
  }

  fetchTabRenewals(): void {
    this.loading.set(true);

    if (this.activeTab === 'UPCOMING') {
      this.renewalService.getUpcomingRenewals(this.upcomingDays).subscribe({
        next: (data) => {
          this.renewals.set(data);
          this.filteredRenewals.set(data);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(err?.error?.detail || 'Failed to load upcoming renewals.');
          this.loading.set(false);
        }
      });
    } else if (this.activeTab === 'EXPIRED') {
      this.renewalService.getExpiredRenewals().subscribe({
        next: (data) => {
          this.renewals.set(data);
          this.filteredRenewals.set(data);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(err?.error?.detail || 'Failed to load expired renewals.');
          this.loading.set(false);
        }
      });
    } else {
      this.renewalService.getRenewals().subscribe({
        next: (data) => {
          this.renewals.set(data);
          this.filteredRenewals.set(data);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(err?.error?.detail || 'Failed to load renewals list.');
          this.loading.set(false);
        }
      });
    }
  }

  setTab(tab: 'ALL' | 'UPCOMING' | 'EXPIRED'): void {
    this.activeTab = tab;
    this.fetchTabRenewals();
  }

  onContractSelectChange(): void {
    const match = this.contracts().find(c => c.id === Number(this.newRenewal.contract_id));
    if (match) {
      this.newRenewal.previous_expiry_date = match.end_date;
    }
  }

  openCreateModal(): void {
    const today = new Date().toISOString().split('T')[0];
    const defaultNewExpiry = new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0];

    const firstContract = this.contracts()[0];
    this.newRenewal = {
      contract_id: firstContract ? firstContract.id : 1,
      renewal_date: today,
      previous_expiry_date: firstContract ? firstContract.end_date : today,
      new_expiry_date: defaultNewExpiry,
      notes: ''
    };
    this.createError = '';
    this.showCreateModal = true;
  }

  submitCreateRenewal(): void {
    if (!this.newRenewal.renewal_date || !this.newRenewal.previous_expiry_date) {
      this.createError = 'Renewal date and previous expiry date are required.';
      return;
    }

    this.submitting = true;
    this.createError = '';

    this.renewalService.createRenewal(this.newRenewal).subscribe({
      next: () => {
        this.submitting = false;
        this.showCreateModal = false;
        this.fetchTabRenewals();
      },
      error: (err) => {
        this.submitting = false;
        this.createError = err?.error?.detail || 'Failed to create renewal schedule.';
      }
    });
  }

  openCompleteModal(renewal: Renewal): void {
    this.selectedRenewal = renewal;
    this.completeRenewalDate = renewal.renewal_date || new Date().toISOString().split('T')[0];
    this.completeNewExpiryDate = renewal.new_expiry_date || new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0];
    this.showCompleteModal = true;
  }

  submitCompleteRenewal(): void {
    if (!this.selectedRenewal || !this.completeNewExpiryDate) return;

    this.renewalService.completeRenewal(this.selectedRenewal.id, {
      renewal_date: this.completeRenewalDate,
      new_expiry_date: this.completeNewExpiryDate
    }).subscribe({
      next: () => {
        this.showCompleteModal = false;
        this.fetchTabRenewals();
      },
      error: (err) => alert(err?.error?.detail || 'Failed to complete renewal.')
    });
  }

  updateStatus(renewal: Renewal, status: RenewalStatus): void {
    this.renewalService.updateStatus(renewal.id, { status }).subscribe({
      next: () => this.fetchTabRenewals(),
      error: (err) => alert(err?.error?.detail || 'Status update failed.')
    });
  }

  getContractTitle(contractId: number): string {
    const match = this.contracts().find(c => c.id === contractId);
    return match ? `${match.title} (${match.contract_number})` : `Contract #${contractId}`;
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'Upcoming': return 'badge-pending';
      case 'In Progress': return 'badge-review';
      case 'Renewed': return 'badge-completed';
      case 'Expired': return 'badge-expired';
      case 'Cancelled': return 'badge-draft';
      default: return 'badge-pending';
    }
  }
}
