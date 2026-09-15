import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ObligationService } from '../../core/services/obligation.service';
import { ContractService } from '../../core/services/contract.service';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth';
import { Obligation, ObligationCreate, ObligationStatus } from '../../core/models/obligation.model';
import { Contract } from '../../core/models/contract.model';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-obligations',
  imports: [CommonModule, FormsModule],
  templateUrl: './obligations.html',
  styleUrl: './obligations.css'
})
export class Obligations implements OnInit {

  obligations = signal<Obligation[]>([]);
  filteredObligations = signal<Obligation[]>([]);
  contracts = signal<Contract[]>([]);
  users = signal<User[]>([]);

  loading = signal<boolean>(true);
  error = signal<string>('');

  searchQuery = '';
  selectedStatus: string = 'ALL';
  showOverdueOnly = false;

  // Modal State
  showCreateModal = false;
  showProgressModal = false;
  selectedObligation: Obligation | null = null;
  newProgressValue = 0;

  // Create Form Data
  newObligation: ObligationCreate = {
    contract_id: 1,
    title: '',
    description: '',
    obligation_type: 'Payment',
    due_date: '',
    assigned_to: 1
  };

  createError = '';
  submitting = false;

  obligationTypes = [
    'Payment Obligations',
    'Delivery Commitments',
    'Reporting Requirements',
    'Renewal Conditions',
    'Service Level Agreements',
    'Legal Compliance Requirements'
  ];

  statuses: ObligationStatus[] = [
    'Pending',
    'In Progress',
    'Completed',
    'Overdue'
  ];

  constructor(
    private obligationService: ObligationService,
    private contractService: ContractService,
    private userService: UserService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.error.set('');

    // Fetch contracts for selector
    this.contractService.getContracts().subscribe({
      next: (data) => {
        this.contracts.set(data);
        if (data.length > 0) this.newObligation.contract_id = data[0].id;
      }
    });

    // Fetch users for assignment
    this.userService.getUsers().subscribe({
      next: (data) => {
        this.users.set(data);
        if (data.length > 0) this.newObligation.assigned_to = data[0].id;
      }
    });

    // Fetch obligations
    this.fetchObligationsList();
  }

  fetchObligationsList(): void {
    if (this.showOverdueOnly) {
      this.obligationService.getOverdueObligations().subscribe({
        next: (data) => {
          this.obligations.set(data);
          this.applyFilter();
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(err?.error?.detail || 'Failed to load overdue obligations.');
          this.loading.set(false);
        }
      });
    } else {
      this.obligationService.getObligations().subscribe({
        next: (data) => {
          this.obligations.set(data);
          this.applyFilter();
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(err?.error?.detail || 'Failed to load obligations.');
          this.loading.set(false);
        }
      });
    }
  }

  toggleOverdueFilter(): void {
    this.showOverdueOnly = !this.showOverdueOnly;
    this.fetchObligationsList();
  }

  applyFilter(): void {
    let result = this.obligations();

    if (this.selectedStatus !== 'ALL') {
      result = result.filter(o => o.status === this.selectedStatus);
    }

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      result = result.filter(o => 
        o.title.toLowerCase().includes(q) || 
        o.obligation_type.toLowerCase().includes(q)
      );
    }

    this.filteredObligations.set(result);
  }

  openCreateModal(): void {
    const defaultDueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    this.newObligation = {
      contract_id: this.contracts().length > 0 ? this.contracts()[0].id : 1,
      title: '',
      description: '',
      obligation_type: 'Payment',
      due_date: defaultDueDate,
      assigned_to: this.users().length > 0 ? this.users()[0].id : 1
    };
    this.createError = '';
    this.showCreateModal = true;
  }

  submitCreateObligation(): void {
    if (!this.newObligation.title.trim() || !this.newObligation.due_date) {
      this.createError = 'Obligation title and due date are required.';
      return;
    }

    this.submitting = true;
    this.createError = '';

    this.obligationService.createObligation(this.newObligation).subscribe({
      next: () => {
        this.submitting = false;
        this.showCreateModal = false;
        this.fetchObligationsList();
      },
      error: (err) => {
        this.submitting = false;
        this.createError = err?.error?.detail || 'Failed to create obligation.';
      }
    });
  }

  openProgressModal(obligation: Obligation): void {
    this.selectedObligation = obligation;
    this.newProgressValue = obligation.progress || 0;
    this.showProgressModal = true;
  }

  saveProgressUpdate(): void {
    if (!this.selectedObligation) return;

    this.obligationService.updateProgress(this.selectedObligation.id, { progress: this.newProgressValue }).subscribe({
      next: () => {
        this.showProgressModal = false;
        this.fetchObligationsList();
      },
      error: (err) => alert(err?.error?.detail || 'Progress update failed.')
    });
  }

  markCompleted(obligation: Obligation): void {
    this.obligationService.completeObligation(obligation.id).subscribe({
      next: () => this.fetchObligationsList(),
      error: (err) => alert(err?.error?.detail || 'Completion action failed.')
    });
  }

  getContractTitle(contractId: number): string {
    const match = this.contracts().find(c => c.id === contractId);
    return match ? match.title : `Contract #${contractId}`;
  }

  getUserName(userId: number): string {
    const match = this.users().find(u => u.id === userId);
    return match ? match.full_name : `User #${userId}`;
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'Pending': return 'badge-pending';
      case 'In Progress': return 'badge-review';
      case 'Completed': return 'badge-completed';
      case 'Overdue': return 'badge-overdue';
      default: return 'badge-pending';
    }
  }
}
