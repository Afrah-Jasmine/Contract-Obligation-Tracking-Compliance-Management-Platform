import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  Obligations as ObligationsService,
  Obligation
} from '../../services/obligations';

import {
  Contracts as ContractsService,
  Contract
} from '../../services/contracts';

import { Auth } from '../../services/auth';

@Component({
  selector: 'app-obligations',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './obligations.html',
  styleUrl: './obligations.css'
})
export class Obligations implements OnInit {

  obligations: Obligation[] = [];
  filteredObligations: Obligation[] = [];

  contracts: Contract[] = [];

  loading = false;
  loadingContracts = false;
  saving = false;

  errorMessage = '';
  actionMessage = '';

  searchTerm = '';
  selectedStatus = 'All';

  showObligationForm = false;
  showDetails = false;

  editingObligation: Obligation | null = null;
  selectedObligation: Obligation | null = null;

  readonly statusOptions = [
    'All',
    'Pending',
    'In Progress',
    'Completed',
    'Delayed',
    'Overdue'
  ];

  readonly obligationForm;

  constructor(
    private obligationsService: ObligationsService,
    private contractsService: ContractsService,
    private auth: Auth,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.obligationForm = this.fb.nonNullable.group({
      contract_id: [
        0,
        [
          Validators.required,
          Validators.min(1)
        ]
      ],
      title: [
        '',
        [
          Validators.required,
          Validators.maxLength(200)
        ]
      ],
      description: [
        '',
        [
          Validators.maxLength(2000)
        ]
      ],
      obligation_type: [
        '',
        [
          Validators.required,
          Validators.maxLength(100)
        ]
      ],
      due_date: [
        '',
        [
          Validators.required
        ]
      ],
      assigned_to: [
        0,
        [
          Validators.required,
          Validators.min(1)
        ]
      ]
    });
  }

  ngOnInit(): void {
    this.loadObligations();
    this.loadContracts();
  }

  /* ============================================================
     LOAD DATA
     ============================================================ */

  loadObligations(): void {
    this.loading = true;
    this.errorMessage = '';
    this.actionMessage = '';

    this.obligationsService.getObligations().subscribe({
      next: (data) => {
        console.log(
          'Obligations data received:',
          data
        );

        console.log(
          'Obligations count:',
          data.length
        );

        this.obligations = data;
        this.applyFilters();

        this.loading = false;

        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error(
          'Obligations API error:',
          error
        );

        this.loading = false;

        if (error.status === 401) {
          this.errorMessage =
            'Your session has expired. Please log in again.';
        } else if (error.status === 403) {
          this.errorMessage =
            'You do not have permission to view obligations.';
        } else {
          this.errorMessage =
            'Unable to load obligations. Please try again.';
        }

        this.cdr.detectChanges();
      }
    });
  }

  loadContracts(): void {
    this.loadingContracts = true;

    this.contractsService.getContracts().subscribe({
      next: (data) => {
        this.contracts = data;
        this.loadingContracts = false;

        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error(
          'Contracts API error while loading obligation form:',
          error
        );

        this.loadingContracts = false;

        this.cdr.detectChanges();
      }
    });
  }

  /* ============================================================
     SEARCH / FILTER
     ============================================================ */

  applyFilters(): void {
    const search =
      this.searchTerm.trim().toLowerCase();

    this.filteredObligations =
      this.obligations.filter((obligation) => {

        const contract =
          this.getContract(obligation.contract_id);

        const matchesSearch =
          !search ||
          obligation.title
            .toLowerCase()
            .includes(search) ||
          obligation.obligation_type
            .toLowerCase()
            .includes(search) ||
          obligation.status
            .toLowerCase()
            .includes(search) ||
          String(obligation.contract_id)
            .includes(search) ||
          contract?.contract_number
            ?.toLowerCase()
            .includes(search) ||
          contract?.title
            ?.toLowerCase()
            .includes(search);

        const matchesStatus =
          this.selectedStatus === 'All' ||
          obligation.status === this.selectedStatus;

        return (
          matchesSearch &&
          matchesStatus
        );
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

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = 'All';

    this.applyFilters();
  }

  /* ============================================================
     CREATE / EDIT FORM
     ============================================================ */

  openCreateForm(): void {
    const currentUserId =
      this.auth.getUserId();

    this.editingObligation = null;
    this.selectedObligation = null;

    this.errorMessage = '';
    this.actionMessage = '';

    this.obligationForm.reset({
      contract_id: 0,
      title: '',
      description: '',
      obligation_type: '',
      due_date: '',
      assigned_to: currentUserId ?? 0
    });

    this.showObligationForm = true;
    this.showDetails = false;

    this.cdr.detectChanges();
  }

  openEditForm(
    obligation: Obligation
  ): void {
    this.editingObligation = obligation;
    this.selectedObligation = null;

    this.errorMessage = '';
    this.actionMessage = '';

    this.obligationForm.reset({
      contract_id: obligation.contract_id,
      title: obligation.title,
      description: obligation.description ?? '',
      obligation_type:
        obligation.obligation_type,
      due_date: obligation.due_date,
      assigned_to: obligation.assigned_to
    });

    this.showObligationForm = true;
    this.showDetails = false;

    this.cdr.detectChanges();
  }

  closeObligationForm(): void {
    this.showObligationForm = false;
    this.editingObligation = null;

    this.obligationForm.reset();

    this.cdr.detectChanges();
  }

  submitObligationForm(): void {
    if (this.obligationForm.invalid) {
      this.obligationForm.markAllAsTouched();

      this.errorMessage =
        'Please correct the highlighted fields.';

      this.cdr.detectChanges();
      return;
    }

    const formValue =
      this.obligationForm.getRawValue();

    if (!this.isValidDate(formValue.due_date)) {
      this.errorMessage =
        'Please enter a valid due date.';

      this.cdr.detectChanges();
      return;
    }

    this.saving = true;
    this.errorMessage = '';
    this.actionMessage = '';

    if (this.editingObligation) {

      this.obligationsService
        .updateObligation(
          this.editingObligation.id,
          {
            title: formValue.title,
            description:
              formValue.description || null,
            obligation_type:
              formValue.obligation_type,
            due_date:
              formValue.due_date,
            assigned_to:
              formValue.assigned_to
          }
        )
        .subscribe({
          next: (updatedObligation) => {

            this.replaceObligation(
              updatedObligation
            );

            this.saving = false;
            this.showObligationForm = false;
            this.editingObligation = null;

            this.actionMessage =
              'Obligation updated successfully.';

            this.applyFilters();

            this.cdr.detectChanges();
          },

          error: (error) => {
            this.handleSaveError(error);
          }
        });

      return;
    }

    this.obligationsService
      .createObligation({
        contract_id:
          formValue.contract_id,
        title:
          formValue.title,
        description:
          formValue.description || null,
        obligation_type:
          formValue.obligation_type,
        due_date:
          formValue.due_date,
        assigned_to:
          formValue.assigned_to
      })
      .subscribe({
        next: (createdObligation) => {

          this.obligations = [
            createdObligation,
            ...this.obligations
          ];

          this.saving = false;
          this.showObligationForm = false;

          this.actionMessage =
            'Obligation created successfully.';

          this.applyFilters();

          this.cdr.detectChanges();
        },

        error: (error) => {
          this.handleSaveError(error);
        }
      });
  }

  /* ============================================================
     DETAILS
     ============================================================ */

  viewDetails(
    obligation: Obligation
  ): void {
    this.selectedObligation = obligation;

    this.showDetails = true;
    this.showObligationForm = false;

    this.errorMessage = '';
    this.actionMessage = '';

    this.cdr.detectChanges();
  }

  closeDetails(): void {
    this.showDetails = false;
    this.selectedObligation = null;

    this.cdr.detectChanges();
  }

  /* ============================================================
     STATUS ACTIONS
     ============================================================ */

  updateStatus(
    obligation: Obligation,
    newStatus: string
  ): void {

    if (
      !this.canTransition(
        obligation.status,
        newStatus
      )
    ) {
      this.errorMessage =
        `Invalid status transition: ${obligation.status} → ${newStatus}`;

      this.cdr.detectChanges();
      return;
    }

    this.saving = true;
    this.errorMessage = '';
    this.actionMessage = '';

    this.obligationsService
      .updateObligationStatus(
        obligation.id,
        newStatus
      )
      .subscribe({
        next: (updatedObligation) => {

          this.replaceObligation(
            updatedObligation
          );

          if (
            this.selectedObligation?.id ===
            updatedObligation.id
          ) {
            this.selectedObligation =
              updatedObligation;
          }

          this.saving = false;

          this.actionMessage =
            `Obligation status changed to ${newStatus}.`;

          this.applyFilters();

          this.cdr.detectChanges();
        },

        error: (error) => {
          console.error(
            'Obligation status update error:',
            error
          );

          this.saving = false;

          if (error.status === 400) {
            this.errorMessage =
              error.error?.detail ||
              'This status transition is not allowed.';
          } else if (error.status === 401) {
            this.errorMessage =
              'Your session has expired. Please login again.';
          } else if (error.status === 403) {
            this.errorMessage =
              'You do not have permission to change this status.';
          } else if (error.status === 404) {
            this.errorMessage =
              'Obligation was not found.';
          } else {
            this.errorMessage =
              'Unable to update obligation status.';
          }

          this.cdr.detectChanges();
        }
      });
  }

  completeObligation(
    obligation: Obligation
  ): void {

    if (
      obligation.status === 'Completed'
    ) {
      this.errorMessage =
        'This obligation is already completed.';

      this.cdr.detectChanges();
      return;
    }

    this.saving = true;
    this.errorMessage = '';
    this.actionMessage = '';

    this.obligationsService
      .completeObligation(
        obligation.id
      )
      .subscribe({
        next: (updatedObligation) => {

          this.replaceObligation(
            updatedObligation
          );

          if (
            this.selectedObligation?.id ===
            updatedObligation.id
          ) {
            this.selectedObligation =
              updatedObligation;
          }

          this.saving = false;

          this.actionMessage =
            'Obligation completed successfully.';

          this.applyFilters();

          this.cdr.detectChanges();
        },

        error: (error) => {
          console.error(
            'Complete obligation error:',
            error
          );

          this.saving = false;

          if (error.status === 400) {
            this.errorMessage =
              error.error?.detail ||
              'This obligation cannot be completed.';
          } else if (error.status === 401) {
            this.errorMessage =
              'Your session has expired. Please login again.';
          } else if (error.status === 404) {
            this.errorMessage =
              'Obligation was not found.';
          } else {
            this.errorMessage =
              'Unable to complete the obligation.';
          }

          this.cdr.detectChanges();
        }
      });
  }

  /* ============================================================
     STATUS HELPERS
     ============================================================ */

  canTransition(
    currentStatus: string,
    newStatus: string
  ): boolean {

    const transitions: Record<
      string,
      string[]
    > = {
      'Pending': [
        'In Progress'
      ],

      'In Progress': [
        'Completed',
        'Delayed',
        'Overdue'
      ],

      'Delayed': [
        'In Progress',
        'Completed',
        'Overdue'
      ],

      'Completed': [],

      'Overdue': [
        'In Progress',
        'Completed'
      ]
    };

    return (
      transitions[currentStatus]
        ?.includes(newStatus) ?? false
    );
  }

  getAvailableStatuses(
    currentStatus: string
  ): string[] {

    const transitions: Record<
      string,
      string[]
    > = {
      'Pending': [
        'In Progress'
      ],

      'In Progress': [
        'Completed',
        'Delayed',
        'Overdue'
      ],

      'Delayed': [
        'In Progress',
        'Completed',
        'Overdue'
      ],

      'Completed': [],

      'Overdue': [
        'In Progress',
        'Completed'
      ]
    };

    return transitions[currentStatus] ?? [];
  }

  /* ============================================================
     ROLE / PERMISSION HELPERS
     ============================================================ */

  canManageObligations(): boolean {
    const role = this.auth.getRole();

    return (
      role === 'Administrator' ||
      role === 'Compliance Officer' ||
      role === 'Department Head'
    );
  }

  canChangeStatus(): boolean {
    return this.auth.isLoggedIn();
  }

  /* ============================================================
     DATA HELPERS
     ============================================================ */

  getContract(
    contractId: number
  ): Contract | undefined {
    return this.contracts.find(
      contract =>
        contract.id === contractId
    );
  }

  getContractName(
    contractId: number
  ): string {
    const contract =
      this.getContract(contractId);

    if (!contract) {
      return `Contract #${contractId}`;
    }

    return contract.contract_number
      ? `${contract.contract_number} - ${contract.title}`
      : contract.title;
  }

  getStatusClass(
    status: string
  ): string {
    switch (status) {

      case 'Pending':
        return 'status-pending';

      case 'In Progress':
        return 'status-progress';

      case 'Completed':
        return 'status-completed';

      case 'Delayed':
        return 'status-delayed';

      case 'Overdue':
        return 'status-overdue';

      default:
        return '';
    }
  }

  getProgressClass(
    progress: number
  ): string {
    if (progress >= 100) {
      return 'progress-completed';
    }

    if (progress >= 50) {
      return 'progress-in-progress';
    }

    return 'progress-pending';
  }

  isOverdue(
    obligation: Obligation
  ): boolean {

    if (
      obligation.status === 'Completed'
    ) {
      return false;
    }

    if (!obligation.due_date) {
      return false;
    }

    const dueDate =
      new Date(obligation.due_date);

    const today =
      new Date();

    dueDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    return dueDate < today;
  }

  private isValidDate(
    value: string
  ): boolean {
    if (!value) {
      return false;
    }

    const date =
      new Date(value);

    return !Number.isNaN(
      date.getTime()
    );
  }

  private replaceObligation(
    updatedObligation: Obligation
  ): void {

    this.obligations =
      this.obligations.map(
        obligation =>
          obligation.id ===
          updatedObligation.id
            ? updatedObligation
            : obligation
      );
  }

  /* ============================================================
     ERROR HANDLING
     ============================================================ */

  private handleSaveError(
    error: any
  ): void {

    console.error(
      'Obligation save error:',
      error
    );

    this.saving = false;

    if (error.status === 400) {
      this.errorMessage =
        error.error?.detail ||
        'The obligation could not be saved. Please check the entered values.';
    } else if (error.status === 401) {
      this.errorMessage =
        'Your session has expired. Please log in again.';
    } else if (error.status === 403) {
      this.errorMessage =
        'You do not have permission to manage obligations.';
    } else if (error.status === 404) {
      this.errorMessage =
        error.error?.detail ||
        'The selected contract or user was not found.';
    } else if (error.status === 422) {
      this.errorMessage =
        'Some obligation fields are invalid. Please check your input.';
    } else {
      this.errorMessage =
        'Unable to save the obligation. Please try again.';
    }

    this.cdr.detectChanges();
  }
}