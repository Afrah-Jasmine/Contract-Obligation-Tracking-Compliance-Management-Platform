import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import {
  Contracts as ContractsService,
  Contract
} from '../../services/contracts';

@Component({
  selector: 'app-contracts',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './contracts.html',
  styleUrl: './contracts.css'
})
export class Contracts implements OnInit {

  contracts: Contract[] = [];
  filteredContracts: Contract[] = [];

  loading = false;
  saving = false;
  errorMessage = '';
  actionMessage = '';

  searchTerm = '';
  selectedStatus = 'All';

  showContractForm = false;
  showDetails = false;

  editingContract: Contract | null = null;
  selectedContract: Contract | null = null;

  readonly statusOptions = [
    'All',
    'Draft',
    'Under Review',
    'Approved',
    'Active',
    'Expired',
    'Terminated'
  ];

  readonly contractForm;

  constructor(
    private contractsService: ContractsService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.contractForm = this.fb.nonNullable.group({
      title: ['', [Validators.required, Validators.maxLength(200)]],
      contract_number: ['', [Validators.required, Validators.maxLength(100)]],
      category: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(2000)]],
      start_date: [''],
      end_date: ['']
    });
  }

  ngOnInit(): void {
    this.loadContracts();
  }

  loadContracts(): void {
    this.loading = true;
    this.errorMessage = '';
    this.actionMessage = '';

    this.contractsService.getContracts().subscribe({
      next: (data) => {
        console.log('Contracts data received:', data);
        console.log('Contracts count:', data.length);

        this.contracts = data;
        this.applyFilters();

        this.loading = false;
        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error('Contracts API error:', error);

        this.loading = false;

        if (error.status === 401) {
          this.errorMessage =
            'Your session has expired. Please log in again.';
        } else if (error.status === 403) {
          this.errorMessage =
            'You do not have permission to view contracts.';
        } else {
          this.errorMessage =
            'Unable to load contracts. Please try again.';
        }

        this.cdr.detectChanges();
      }
    });
  }

  applyFilters(): void {
    const search = this.searchTerm.trim().toLowerCase();

    this.filteredContracts = this.contracts.filter((contract) => {
      const matchesSearch =
        !search ||
        contract.contract_number.toLowerCase().includes(search) ||
        contract.title.toLowerCase().includes(search) ||
        contract.category.toLowerCase().includes(search);

      const matchesStatus =
        this.selectedStatus === 'All' ||
        contract.status === this.selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }

  onSearchChange(value: string): void {
    this.searchTerm = value;
    this.applyFilters();
  }

  onStatusChange(value: string): void {
    this.selectedStatus = value;
    this.applyFilters();
  }

  openCreateForm(): void {
    this.editingContract = null;
    this.selectedContract = null;

    this.actionMessage = '';
    this.errorMessage = '';

    this.contractForm.reset({
      title: '',
      contract_number: '',
      category: '',
      description: '',
      start_date: '',
      end_date: ''
    });

    this.showContractForm = true;
    this.showDetails = false;

    this.cdr.detectChanges();
  }

  openEditForm(contract: Contract): void {
    this.editingContract = contract;
    this.selectedContract = null;

    this.actionMessage = '';
    this.errorMessage = '';

    this.contractForm.reset({
      title: contract.title,
      contract_number: contract.contract_number,
      category: contract.category,
      description: contract.description ?? '',
      start_date: contract.start_date ?? '',
      end_date: contract.end_date ?? ''
    });

    this.showContractForm = true;
    this.showDetails = false;

    this.cdr.detectChanges();
  }

  closeContractForm(): void {
    this.showContractForm = false;
    this.editingContract = null;

    this.contractForm.reset();

    this.cdr.detectChanges();
  }

  submitContractForm(): void {
    if (this.contractForm.invalid) {
      this.contractForm.markAllAsTouched();

      this.errorMessage =
        'Please correct the highlighted fields.';

      this.cdr.detectChanges();
      return;
    }

    const formValue = this.contractForm.getRawValue();

    if (
      formValue.start_date &&
      formValue.end_date &&
      formValue.start_date > formValue.end_date
    ) {
      this.errorMessage =
        'Start date cannot be later than the end date.';

      this.cdr.detectChanges();
      return;
    }

    this.saving = true;
    this.errorMessage = '';
    this.actionMessage = '';

    if (this.editingContract) {
      this.contractsService.updateContract(
        this.editingContract.id,
        {
          title: formValue.title,
          category: formValue.category,
          description: formValue.description || null,
          start_date: formValue.start_date || null,
          end_date: formValue.end_date || null
        }
      ).subscribe({
        next: (updatedContract) => {
          this.replaceContract(updatedContract);

          this.saving = false;
          this.showContractForm = false;
          this.editingContract = null;

          this.actionMessage =
            'Contract updated successfully.';

          this.applyFilters();
          this.cdr.detectChanges();
        },

        error: (error) => {
          this.handleSaveError(error);
        }
      });

      return;
    }

    this.contractsService.createContract({
      title: formValue.title,
      contract_number: formValue.contract_number,
      category: formValue.category,
      description: formValue.description || null,
      start_date: formValue.start_date || null,
      end_date: formValue.end_date || null
    }).subscribe({
      next: (createdContract) => {
        this.contracts = [
          createdContract,
          ...this.contracts
        ];

        this.saving = false;
        this.showContractForm = false;

        this.actionMessage =
          'Contract created successfully.';

        this.applyFilters();
        this.cdr.detectChanges();
      },

      error: (error) => {
        this.handleSaveError(error);
      }
    });
  }

  viewDetails(contract: Contract): void {
    this.selectedContract = contract;

    this.showDetails = true;
    this.showContractForm = false;

    this.errorMessage = '';
    this.actionMessage = '';

    this.cdr.detectChanges();
  }

  closeDetails(): void {
    this.showDetails = false;
    this.selectedContract = null;

    this.cdr.detectChanges();
  }

  submitForReview(contract: Contract): void {
    this.performAction(
      contract,
      'submitForReview',
      'Contract submitted for review successfully.'
    );
  }

  approveContract(contract: Contract): void {
    this.performAction(
      contract,
      'approveContract',
      'Contract approved successfully.'
    );
  }

  activateContract(contract: Contract): void {
    this.performAction(
      contract,
      'activateContract',
      'Contract activated successfully.'
    );
  }

  private performAction(
    contract: Contract,
    action:
      | 'submitForReview'
      | 'approveContract'
      | 'activateContract',
    successMessage: string
  ): void {

    this.saving = true;
    this.errorMessage = '';
    this.actionMessage = '';

    let request;

    if (action === 'submitForReview') {
      request =
        this.contractsService.submitForReview(contract.id);
    } else if (action === 'approveContract') {
      request =
        this.contractsService.approveContract(contract.id);
    } else {
      request =
        this.contractsService.activateContract(contract.id);
    }

    request.subscribe({
      next: (updatedContract) => {
        this.replaceContract(updatedContract);

        if (
          this.selectedContract?.id ===
          updatedContract.id
        ) {
          this.selectedContract = updatedContract;
        }

        this.saving = false;
        this.actionMessage = successMessage;

        this.applyFilters();
        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error(
          'Contract action error:',
          error
        );

        this.saving = false;

        if (error.status === 400) {
          this.errorMessage =
            error.error?.detail ||
            'This contract action is not allowed for the current status.';
        } else if (error.status === 401) {
          this.errorMessage =
            'Your session has expired. Please log in again.';
        } else if (error.status === 403) {
          this.errorMessage =
            'You do not have permission to perform this action.';
        } else if (error.status === 404) {
          this.errorMessage =
            'Contract was not found.';
        } else {
          this.errorMessage =
            'Unable to complete the contract action.';
        }

        this.cdr.detectChanges();
      }
    });
  }

  private replaceContract(
    updatedContract: Contract
  ): void {
    this.contracts = this.contracts.map(
      (contract) =>
        contract.id === updatedContract.id
          ? updatedContract
          : contract
    );
  }

  private handleSaveError(error: any): void {
    console.error(
      'Contract save error:',
      error
    );

    this.saving = false;

    if (error.status === 400) {
      this.errorMessage =
        error.error?.detail ||
        'The contract could not be saved. Please check the entered values.';
    } else if (error.status === 401) {
      this.errorMessage =
        'Your session has expired. Please log in again.';
    } else if (error.status === 403) {
      this.errorMessage =
        'You do not have permission to manage contracts.';
    } else if (error.status === 422) {
      this.errorMessage =
        'Some contract fields are invalid. Please check your input.';
    } else {
      this.errorMessage =
        'Unable to save the contract. Please try again.';
    }

    this.cdr.detectChanges();
  }

  canManageContracts(): boolean {
    const role = this.getRole();

    return (
      role === 'Administrator' ||
      role === 'Legal Manager' ||
      role === 'Contract Manager'
    );
  }

  canApproveContracts(): boolean {
    const role = this.getRole();

    return (
      role === 'Administrator' ||
      role === 'Legal Manager'
    );
  }

  private getRole(): string | null {
    const token =
      localStorage.getItem('access_token');

    if (!token) {
      return null;
    }

    try {
      const payload = JSON.parse(
        atob(token.split('.')[1])
      );

      return payload.role ?? null;
    } catch {
      return null;
    }
  }

  canSubmitForReview(
    contract: Contract
  ): boolean {
    return (
      this.canManageContracts() &&
      contract.status === 'Draft'
    );
  }

  canApprove(
    contract: Contract
  ): boolean {
    return (
      this.canApproveContracts() &&
      contract.status === 'Under Review'
    );
  }

  canActivate(
    contract: Contract
  ): boolean {
    return (
      this.canManageContracts() &&
      contract.status === 'Approved'
    );
  }

  canEdit(
    contract: Contract
  ): boolean {
    return (
      this.canManageContracts() &&
      !['Expired', 'Terminated'].includes(
        contract.status
      )
    );
  }

  getStatusClass(
    status: string
  ): string {
    switch (status) {
      case 'Draft':
        return 'status-draft';

      case 'Under Review':
        return 'status-review';

      case 'Approved':
        return 'status-approved';

      case 'Active':
        return 'status-active';

      case 'Expired':
        return 'status-expired';

      case 'Terminated':
        return 'status-terminated';

      default:
        return '';
    }
  }
}