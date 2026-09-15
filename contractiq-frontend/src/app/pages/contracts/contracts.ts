import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContractService } from '../../core/services/contract.service';
import { AuthService } from '../../core/services/auth';
import { Contract, ContractCreate, ContractStatus } from '../../core/models/contract.model';

@Component({
  selector: 'app-contracts',
  imports: [CommonModule, FormsModule],
  templateUrl: './contracts.html',
  styleUrl: './contracts.css'
})
export class Contracts implements OnInit {

  contracts = signal<Contract[]>([]);
  filteredContracts = signal<Contract[]>([]);
  loading = signal<boolean>(true);
  error = signal<string>('');
  
  searchQuery = '';
  selectedStatus: string = 'ALL';

  // Modal control states
  showCreateModal = false;
  showDetailsModal = false;
  selectedContract: Contract | null = null;

  // New Contract Form Data
  newContract: ContractCreate = {
    title: '',
    contract_number: '',
    category: 'Vendor Agreement',
    description: '',
    start_date: '',
    end_date: ''
  };

  createError = '';
  submitting = false;

  categories = [
    'Employment Contracts',
    'Vendor Contracts',
    'Service Agreements',
    'Lease Agreements',
    'Purchase Agreements',
    'Partnership Agreements',
    'Confidentiality Agreements'
  ];

  statuses: ContractStatus[] = [
    'Draft',
    'Under Review',
    'Approved',
    'Active',
    'Expired',
    'Terminated'
  ];

  constructor(
    private contractService: ContractService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadContracts();
  }

  loadContracts(): void {
    this.loading.set(true);
    this.error.set('');

    this.contractService.getContracts().subscribe({
      next: (data) => {
        this.contracts.set(data);
        this.applyFilter();
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load contracts:', err);
        this.error.set(err?.error?.detail || 'Failed to load contract records.');
        this.loading.set(false);
      }
    });
  }

  applyFilter(): void {
    let result = this.contracts();

    if (this.selectedStatus !== 'ALL') {
      result = result.filter(c => c.status === this.selectedStatus);
    }

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      result = result.filter(c => 
        c.title.toLowerCase().includes(q) || 
        c.contract_number.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q)
      );
    }

    this.filteredContracts.set(result);
  }

  openCreateModal(): void {
    const today = new Date().toISOString().split('T')[0];
    const nextYear = new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0];

    this.newContract = {
      title: '',
      contract_number: 'CNT-' + Math.floor(100000 + Math.random() * 900000),
      category: 'Vendor Agreement',
      description: '',
      start_date: today,
      end_date: nextYear
    };
    this.createError = '';
    this.showCreateModal = true;
  }

  submitCreateContract(): void {
    if (!this.newContract.title.trim() || !this.newContract.contract_number.trim()) {
      this.createError = 'Title and Contract Number are required.';
      return;
    }

    this.submitting = true;
    this.createError = '';

    this.contractService.createContract(this.newContract).subscribe({
      next: () => {
        this.submitting = false;
        this.showCreateModal = false;
        this.loadContracts();
      },
      error: (err) => {
        this.submitting = false;
        this.createError = err?.error?.detail || 'Failed to create contract.';
      }
    });
  }

  viewDetails(contract: Contract): void {
    this.selectedContract = contract;
    this.showDetailsModal = true;
  }

  submitForReview(contract: Contract): void {
    this.contractService.submitForReview(contract.id).subscribe({
      next: () => {
        this.loadContracts();
        if (this.selectedContract?.id === contract.id) this.showDetailsModal = false;
      },
      error: (err) => alert(err?.error?.detail || 'Action failed.')
    });
  }

  approveContract(contract: Contract): void {
    this.contractService.approveContract(contract.id).subscribe({
      next: () => {
        this.loadContracts();
        if (this.selectedContract?.id === contract.id) this.showDetailsModal = false;
      },
      error: (err) => alert(err?.error?.detail || 'Action failed.')
    });
  }

  activateContract(contract: Contract): void {
    this.contractService.activateContract(contract.id).subscribe({
      next: () => {
        this.loadContracts();
        if (this.selectedContract?.id === contract.id) this.showDetailsModal = false;
      },
      error: (err) => alert(err?.error?.detail || 'Action failed.')
    });
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'Draft': return 'badge-draft';
      case 'Under Review': return 'badge-review';
      case 'Approved': return 'badge-approved';
      case 'Active': return 'badge-active';
      case 'Expired': return 'badge-expired';
      default: return 'badge-draft';
    }
  }
}
