import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  Renewals as RenewalsService,
  Renewal,
  RenewalCreate,
  RenewalUpdate,
  RenewalStatusUpdate,
  RenewalComplete
} from '../../services/renewals';

import {
  Contracts as ContractsService,
  Contract
} from '../../services/contracts';

import { Auth } from '../../services/auth';

@Component({
  selector: 'app-renewals',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './renewals.html',
  styleUrl: './renewals.css'
})
export class Renewals implements OnInit {

  renewals: Renewal[] = [];
  filteredRenewals: Renewal[] = [];
  contracts: Contract[] = [];

  loading = false;
  loadingContracts = false;
  saving = false;

  errorMessage = '';
  actionMessage = '';

  searchTerm = '';
  selectedStatus = 'All';
  selectedDateFilter = 'All';

  statusOptions = [
    'All',
    'Upcoming',
    'In Progress',
    'Renewed',
    'Expired',
    'Cancelled'
  ];

  dateFilterOptions = [
    'All',
    'Next 30 Days',
    'Next 60 Days',
    'Next 90 Days',
    'Expired'
  ];

  showRenewalForm = false;
  showDetails = false;
  showCompleteForm = false;

  editingRenewal: Renewal | null = null;
  selectedRenewal: Renewal | null = null;

  renewalForm: FormGroup;
  completeForm: FormGroup;

  constructor(
    private renewalsService: RenewalsService,
    private contractsService: ContractsService,
    private auth: Auth,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.renewalForm = this.fb.group({
      contract_id: [null, Validators.required],
      renewal_date: ['', Validators.required],
      previous_expiry_date: ['', Validators.required],
      new_expiry_date: ['', Validators.required],
      assigned_to: [null, Validators.required],
      notes: ['']
    });

    this.completeForm = this.fb.group({
      new_expiry_date: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadRenewals();
    this.loadContracts();
  }

  loadRenewals(): void {
    this.loading = true;
    this.errorMessage = '';

    this.renewalsService.getRenewals().subscribe({
      next: (data) => {
        this.renewals = data || [];
        this.applyFilters();
        this.loading = false;
        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error('Renewals API error:', error);

        this.loading = false;

        if (error?.status === 401) {
          this.errorMessage =
            'Your session has expired. Please log in again.';
        } else if (error?.status === 403) {
          this.errorMessage =
            'You do not have permission to view renewals.';
        } else {
          this.errorMessage =
            'Unable to load renewals. Please try again.';
        }

        this.cdr.detectChanges();
      }
    });
  }

  loadContracts(): void {
    this.loadingContracts = true;

    this.contractsService.getContracts().subscribe({
      next: (data) => {
        this.contracts = data || [];
        this.loadingContracts = false;
        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error(
          'Contracts API error while loading renewals:',
          error
        );

        this.contracts = [];
        this.loadingContracts = false;
        this.cdr.detectChanges();
      }
    });
  }

  applyFilters(): void {
    let result = [...this.renewals];

    const search = this.searchTerm.trim().toLowerCase();

    if (search) {
      result = result.filter((renewal) => {
        const contract = this.getContract(renewal.contract_id);

        const contractNumber =
          contract?.contract_number?.toLowerCase() || '';

        const contractTitle =
          contract?.title?.toLowerCase() || '';

        const renewalId =
          String(renewal.id).toLowerCase();

        const status =
          renewal.status?.toLowerCase() || '';

        return (
          renewalId.includes(search) ||
          contractNumber.includes(search) ||
          contractTitle.includes(search) ||
          status.includes(search)
        );
      });
    }

    if (this.selectedStatus !== 'All') {
      result = result.filter(
        renewal => renewal.status === this.selectedStatus
      );
    }

    if (this.selectedDateFilter !== 'All') {
      result = result.filter(
        renewal => this.matchesDateFilter(renewal)
      );
    }

    this.filteredRenewals = result;
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onStatusChange(): void {
    this.applyFilters();
  }

  onDateFilterChange(): void {
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = 'All';
    this.selectedDateFilter = 'All';
    this.applyFilters();
  }

  openCreateForm(): void {
    this.editingRenewal = null;
    this.errorMessage = '';
    this.actionMessage = '';

    this.renewalForm.reset({
      contract_id: null,
      renewal_date: this.toDateInput(new Date()),
      previous_expiry_date: '',
      new_expiry_date: '',
      assigned_to: this.auth.getUserId(),
      notes: ''
    });

    this.showRenewalForm = true;
  }

  openEditForm(renewal: Renewal): void {
    if (!this.canManageRenewals()) {
      return;
    }

    this.editingRenewal = renewal;
    this.errorMessage = '';
    this.actionMessage = '';

    this.renewalForm.reset({
      contract_id: renewal.contract_id,
      renewal_date: renewal.renewal_date,
      previous_expiry_date: renewal.previous_expiry_date,
      new_expiry_date: renewal.new_expiry_date,
      assigned_to: renewal.assigned_to,
      notes: renewal.notes || ''
    });

    this.showRenewalForm = true;
  }

  closeRenewalForm(): void {
    if (this.saving) {
      return;
    }

    this.showRenewalForm = false;
    this.editingRenewal = null;
    this.renewalForm.reset();
  }

  onContractChange(): void {
    const contractId = Number(
      this.renewalForm.get('contract_id')?.value
    );

    if (!contractId) {
      this.renewalForm.patchValue({
        previous_expiry_date: ''
      });

      return;
    }

    const contract = this.getContract(contractId);

    if (contract?.end_date) {
      this.renewalForm.patchValue({
        previous_expiry_date: contract.end_date
      });
    }
  }

  submitRenewalForm(): void {
    this.errorMessage = '';
    this.actionMessage = '';

    if (!this.canManageRenewals()) {
      this.errorMessage =
        'You do not have permission to manage renewals.';
      return;
    }

    if (this.renewalForm.invalid) {
      this.renewalForm.markAllAsTouched();

      this.errorMessage =
        'Please complete all required fields.';
      return;
    }

    const value = this.renewalForm.value;

    const contractId = Number(value.contract_id);
    const assignedTo = Number(value.assigned_to);

    const renewalDate = value.renewal_date;
    const previousExpiryDate = value.previous_expiry_date;
    const newExpiryDate = value.new_expiry_date;

    if (!this.isValidDate(renewalDate)) {
      this.errorMessage =
        'Please enter a valid renewal date.';
      return;
    }

    if (!this.isValidDate(previousExpiryDate)) {
      this.errorMessage =
        'Please enter a valid previous expiry date.';
      return;
    }

    if (!this.isValidDate(newExpiryDate)) {
      this.errorMessage =
        'Please enter a valid new expiry date.';
      return;
    }

    if (renewalDate < previousExpiryDate) {
      this.errorMessage =
        'Renewal date cannot be before the previous expiry date.';
      return;
    }

    if (newExpiryDate < renewalDate) {
      this.errorMessage =
        'New expiry date cannot be before the renewal date.';
      return;
    }

    const contract = this.getContract(contractId);

    if (!contract) {
      this.errorMessage =
        'Selected contract could not be found.';
      return;
    }

    if (
      contract.end_date &&
      previousExpiryDate !== contract.end_date
    ) {
      this.errorMessage =
        'Previous expiry date must match the contract end date.';
      return;
    }

    this.saving = true;

    if (this.editingRenewal) {
      const updateData: RenewalUpdate = {
        renewal_date: renewalDate,
        new_expiry_date: newExpiryDate,
        assigned_to: assignedTo,
        notes: value.notes || null
      };

      this.renewalsService
        .updateRenewal(
          this.editingRenewal.id,
          updateData
        )
        .subscribe({
          next: (updatedRenewal) => {
            this.replaceRenewal(updatedRenewal);

            this.saving = false;
            this.showRenewalForm = false;
            this.editingRenewal = null;

            this.actionMessage =
              'Renewal updated successfully.';

            this.applyFilters();
            this.cdr.detectChanges();
          },

          error: (error) => {
            this.handleSaveError(error);
          }
        });

      return;
    }

    const createData: RenewalCreate = {
      contract_id: contractId,
      renewal_date: renewalDate,
      previous_expiry_date: previousExpiryDate,
      new_expiry_date: newExpiryDate,
      assigned_to: assignedTo,
      notes: value.notes || null
    };

    this.renewalsService
      .createRenewal(createData)
      .subscribe({
        next: (createdRenewal) => {
          this.renewals = [
            ...this.renewals,
            createdRenewal
          ];

          this.saving = false;
          this.showRenewalForm = false;

          this.actionMessage =
            'Renewal created successfully.';

          this.applyFilters();
          this.cdr.detectChanges();
        },

        error: (error) => {
          this.handleSaveError(error);
        }
      });
  }

  viewDetails(renewal: Renewal): void {
    this.errorMessage = '';

    this.renewalsService
      .getRenewalById(renewal.id)
      .subscribe({
        next: (data) => {
          this.selectedRenewal = data;
          this.showDetails = true;
          this.cdr.detectChanges();
        },

        error: (error) => {
          console.error(
            'Renewal details error:',
            error
          );

          this.errorMessage =
            'Unable to load renewal details.';
        }
      });
  }

  closeDetails(): void {
    this.showDetails = false;
    this.selectedRenewal = null;
  }

  updateStatus(
    renewal: Renewal,
    newStatus: string
  ): void {
    this.errorMessage = '';
    this.actionMessage = '';

    if (!this.canManageRenewals()) {
      this.errorMessage =
        'You do not have permission to change renewal status.';
      return;
    }

    if (
      !this.canTransition(
        renewal.status,
        newStatus
      )
    ) {
      this.errorMessage =
        `Renewal cannot be changed from ${renewal.status} to ${newStatus}.`;
      return;
    }

    const data: RenewalStatusUpdate = {
      status: newStatus
    };

    this.saving = true;

    this.renewalsService
      .updateRenewalStatus(
        renewal.id,
        data
      )
      .subscribe({
        next: (updatedRenewal) => {
          this.replaceRenewal(updatedRenewal);

          this.saving = false;

          this.actionMessage =
            `Renewal status changed to ${newStatus}.`;

          this.applyFilters();
          this.cdr.detectChanges();
        },

        error: (error) => {
          console.error(
            'Renewal status update error:',
            error
          );

          this.saving = false;

          if (error?.status === 401) {
            this.errorMessage =
              'Your session has expired. Please log in again.';
          } else if (error?.status === 403) {
            this.errorMessage =
              'You do not have permission to change renewal status.';
          } else if (error?.status === 400) {
            this.errorMessage =
              error?.error?.detail ||
              'This status change is not allowed.';
          } else {
            this.errorMessage =
              'Unable to update renewal status.';
          }

          this.cdr.detectChanges();
        }
      });
  }

  openCompleteForm(
    renewal: Renewal
  ): void {
    if (!this.canManageRenewals()) {
      return;
    }

    if (renewal.status !== 'In Progress') {
      this.errorMessage =
        'Only renewals in progress can be completed.';
      return;
    }

    this.selectedRenewal = renewal;
    this.errorMessage = '';

    this.completeForm.reset({
      new_expiry_date: renewal.new_expiry_date
    });

    this.showCompleteForm = true;
  }

  closeCompleteForm(): void {
    if (this.saving) {
      return;
    }

    this.showCompleteForm = false;
    this.completeForm.reset();
  }

  completeRenewal(): void {
    this.errorMessage = '';
    this.actionMessage = '';

    if (!this.selectedRenewal) {
      return;
    }

    if (!this.canManageRenewals()) {
      this.errorMessage =
        'You do not have permission to complete renewals.';
      return;
    }

    if (this.completeForm.invalid) {
      this.completeForm.markAllAsTouched();

      this.errorMessage =
        'Please enter the new expiry date.';
      return;
    }

    const newExpiryDate =
      this.completeForm.value.new_expiry_date;

    if (!this.isValidDate(newExpiryDate)) {
      this.errorMessage =
        'Please enter a valid new expiry date.';
      return;
    }

    if (
      newExpiryDate <
      this.selectedRenewal.renewal_date
    ) {
      this.errorMessage =
        'New expiry date cannot be before the renewal date.';
      return;
    }

    const data: RenewalComplete = {
      new_expiry_date: newExpiryDate
    };

    this.saving = true;

    this.renewalsService
      .completeRenewal(
        this.selectedRenewal.id,
        data
      )
      .subscribe({
        next: (updatedRenewal) => {
          this.replaceRenewal(updatedRenewal);

          this.saving = false;
          this.showCompleteForm = false;

          this.actionMessage =
            'Renewal completed successfully.';

          this.selectedRenewal = null;
          this.completeForm.reset();

          this.applyFilters();
          this.cdr.detectChanges();
        },

        error: (error) => {
          console.error(
            'Complete renewal error:',
            error
          );

          this.saving = false;

          if (error?.status === 400) {
            this.errorMessage =
              error?.error?.detail ||
              'Unable to complete this renewal.';
          } else if (error?.status === 403) {
            this.errorMessage =
              'You do not have permission to complete renewals.';
          } else {
            this.errorMessage =
              'Unable to complete the renewal.';
          }

          this.cdr.detectChanges();
        }
      });
  }

  canTransition(
    currentStatus: string,
    newStatus: string
  ): boolean {

    if (currentStatus === 'Upcoming') {
      return [
        'In Progress',
        'Expired',
        'Cancelled'
      ].includes(newStatus);
    }

    if (currentStatus === 'In Progress') {
      return [
        'Renewed',
        'Cancelled'
      ].includes(newStatus);
    }

    return false;
  }

  getAvailableStatuses(
    renewal: Renewal
  ): string[] {

    if (renewal.status === 'Upcoming') {
      return [
        'In Progress',
        'Expired',
        'Cancelled'
      ];
    }

    if (renewal.status === 'In Progress') {
      return [
        'Renewed',
        'Cancelled'
      ];
    }

    return [];
  }

  canManageRenewals(): boolean {
    if (!this.auth.isLoggedIn()) {
      return false;
    }

    const role = this.auth.getRole();

    if (!role) {
      return false;
    }

    return [
      'Administrator',
      'Legal Manager',
      'Contract Manager'
    ].includes(role);
  }

  getContract(
    contractId: number
  ): Contract | undefined {
    return this.contracts.find(
      contract => contract.id === contractId
    );
  }

  getContractNumber(
    contractId: number
  ): string {
    const contract = this.getContract(contractId);

    return contract?.contract_number ||
      `Contract #${contractId}`;
  }

  getContractTitle(
    contractId: number
  ): string {
    const contract = this.getContract(contractId);

    return contract?.title ||
      'Unknown Contract';
  }

  getContractName(
    contractId: number
  ): string {
    const contract = this.getContract(contractId);

    if (!contract) {
      return `Contract #${contractId}`;
    }

    return `${contract.contract_number} - ${contract.title}`;
  }

  private matchesDateFilter(
    renewal: Renewal
  ): boolean {

    if (this.selectedDateFilter === 'All') {
      return true;
    }

    const previousExpiry =
      this.parseDate(
        renewal.previous_expiry_date
      );

    if (!previousExpiry) {
      return false;
    }

    const today = this.startOfDay(
      new Date()
    );

    if (this.selectedDateFilter === 'Expired') {
      return previousExpiry < today;
    }

    const daysMap: Record<string, number> = {
      'Next 30 Days': 30,
      'Next 60 Days': 60,
      'Next 90 Days': 90
    };

    const days =
      daysMap[this.selectedDateFilter];

    if (!days) {
      return true;
    }

    const endDate = new Date(today);

    endDate.setDate(
      endDate.getDate() + days
    );

    return (
      previousExpiry >= today &&
      previousExpiry <= endDate
    );
  }

  isAttentionRequired(
    renewal: Renewal
  ): boolean {

    if (
      renewal.status === 'Expired' ||
      renewal.status === 'Cancelled' ||
      renewal.status === 'Renewed'
    ) {
      return false;
    }

    const expiry =
      this.parseDate(
        renewal.previous_expiry_date
      );

    if (!expiry) {
      return false;
    }

    const today = this.startOfDay(
      new Date()
    );

    return expiry <= today;
  }

  isUpcoming(
    renewal: Renewal
  ): boolean {

    const expiry =
      this.parseDate(
        renewal.previous_expiry_date
      );

    if (!expiry) {
      return false;
    }

    const today = this.startOfDay(
      new Date()
    );

    const ninetyDays = new Date(today);

    ninetyDays.setDate(
      ninetyDays.getDate() + 90
    );

    return (
      renewal.status === 'Upcoming' &&
      expiry >= today &&
      expiry <= ninetyDays
    );
  }

  getStatusClass(
    status: string
  ): string {

    switch (status) {
      case 'Upcoming':
        return 'status-upcoming';

      case 'In Progress':
        return 'status-progress';

      case 'Renewed':
        return 'status-renewed';

      case 'Expired':
        return 'status-expired';

      case 'Cancelled':
        return 'status-cancelled';

      default:
        return '';
    }
  }

  getApprovalClass(
    approvalStatus: string | null
  ): string {

    switch (approvalStatus) {
      case 'Approved':
        return 'approval-approved';

      case 'Pending':
        return 'approval-pending';

      case 'Rejected':
        return 'approval-rejected';

      default:
        return '';
    }
  }

  private replaceRenewal(
    updatedRenewal: Renewal
  ): void {

    const index = this.renewals.findIndex(
      renewal =>
        renewal.id === updatedRenewal.id
    );

    if (index === -1) {
      this.renewals = [
        ...this.renewals,
        updatedRenewal
      ];

      return;
    }

    const updated = [
      ...this.renewals
    ];

    updated[index] = updatedRenewal;

    this.renewals = updated;
  }

  private isValidDate(
    value: string
  ): boolean {

    if (!value) {
      return false;
    }

    const date = new Date(
      `${value}T00:00:00`
    );

    return !Number.isNaN(
      date.getTime()
    );
  }

  private parseDate(
    value: string
  ): Date | null {

    if (!value) {
      return null;
    }

    const date = new Date(
      `${value}T00:00:00`
    );

    if (Number.isNaN(
      date.getTime()
    )) {
      return null;
    }

    return date;
  }

  private startOfDay(
    date: Date
  ): Date {

    const result = new Date(date);

    result.setHours(
      0,
      0,
      0,
      0
    );

    return result;
  }

  private toDateInput(
    date: Date
  ): string {

    const year = date.getFullYear();

    const month = String(
      date.getMonth() + 1
    ).padStart(2, '0');

    const day = String(
      date.getDate()
    ).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  private handleSaveError(
    error: any
  ): void {

    console.error(
      'Renewal save error:',
      error
    );

    this.saving = false;

    if (error?.status === 400) {
      this.errorMessage =
        error?.error?.detail ||
        'Invalid renewal information. Please check the entered values.';
    } else if (error?.status === 401) {
      this.errorMessage =
        'Your session has expired. Please log in again.';
    } else if (error?.status === 403) {
      this.errorMessage =
        'You do not have permission to manage renewals.';
    } else if (error?.status === 404) {
      this.errorMessage =
        'The selected contract or renewal could not be found.';
    } else if (error?.status === 409) {
      this.errorMessage =
        error?.error?.detail ||
        'A renewal with this information already exists.';
    } else {
      this.errorMessage =
        'Unable to save the renewal. Please try again.';
    }

    this.cdr.detectChanges();
  }
}