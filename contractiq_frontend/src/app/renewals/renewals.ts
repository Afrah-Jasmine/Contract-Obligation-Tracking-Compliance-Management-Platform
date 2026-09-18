import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize, timeout } from 'rxjs';

import {
  RenewalsService,
  Renewal,
  CreateRenewalRequest,
  UpdateRenewalRequest
} from '../services/renewals';

@Component({
  selector: 'app-renewals',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './renewals.html',
  styleUrl: './renewals.css'
})
export class Renewals implements OnInit {

  renewals: Renewal[] = [];

  loading = false;
  errorMessage = '';

  // Create
  showCreateForm = false;
  creating = false;
  createError = '';
  createSuccess = '';

  newRenewal: CreateRenewalRequest = {
    contract_id: 0,
    assigned_to: 0,
    renewal_date: '',
    notice_days: 30,
    status: 'Upcoming',
    new_expiry_date: null,
    notes: '',
    previous_expiry_date: ''
  };

  // Edit
  showEditForm = false;
  saving = false;
  editErrorMessage = '';
  editingRenewal: Renewal | null = null;

  editForm: UpdateRenewalRequest = {
    assigned_to: 0,
    renewal_date: '',
    notice_days: 30,
    status: 'Upcoming',
    new_expiry_date: null,
    notes: '',
    previous_expiry_date: ''
  };

  constructor(
    private renewalsService: RenewalsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadRenewals();
  }

  // =========================
  // SUMMARY COUNTS
  // =========================

  get totalRenewals(): number {
    return this.renewals.length;
  }

  get upcomingRenewals(): number {
    return this.renewals.filter(
      renewal => renewal.status === 'Upcoming'
    ).length;
  }

  get inProgressRenewals(): number {
    return this.renewals.filter(
      renewal => renewal.status === 'In Progress'
    ).length;
  }

  get renewedRenewals(): number {
    return this.renewals.filter(
      renewal => renewal.status === 'Renewed'
    ).length;
  }

  // =========================
  // LOAD
  // =========================

  loadRenewals(): void {

    this.loading = true;
    this.errorMessage = '';

    this.renewalsService
      .getRenewals()
      .pipe(
        timeout(10000),
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({

        next: (data: Renewal[]) => {

          this.renewals = Array.isArray(data)
            ? data
            : [];

        },

        error: (error: any) => {

          console.error(
            'Error loading renewals:',
            error
          );

          if (error.status === 401) {

            this.errorMessage =
              'You are not authorized to view renewals.';

          }
          else if (error.status === 403) {

            this.errorMessage =
              'You do not have permission to view renewals.';

          }
          else if (error.name === 'TimeoutError') {

            this.errorMessage =
              'Loading renewals is taking too long. Please try again.';

          }
          else if (error.status === 0) {

            this.errorMessage =
              'Unable to connect to ContractIQ server.';

          }
          else {

            this.errorMessage =
              error.error?.detail ||
              'Unable to load renewals. Please try again.';

          }

        }

      });

  }

  // =========================
  // CREATE
  // =========================

  openCreateForm(): void {

    this.showCreateForm = true;

    this.createError = '';
    this.createSuccess = '';

    this.newRenewal = {
      contract_id: 0,
      assigned_to: 0,
      renewal_date: '',
      notice_days: 30,
      status: 'Upcoming',
      new_expiry_date: null,
      notes: '',
      previous_expiry_date: ''
    };

    document.body.style.overflow = 'hidden';
  }

  cancelCreate(): void {

    this.showCreateForm = false;

    this.createError = '';

    document.body.style.overflow = '';
  }

  createRenewal(): void {

    this.createError = '';
    this.createSuccess = '';

    if (
      !this.newRenewal.contract_id ||
      !this.newRenewal.assigned_to ||
      !this.newRenewal.renewal_date ||
      !this.newRenewal.previous_expiry_date
    ) {

      this.createError =
        'Please fill in all required fields.';

      return;
    }

    this.creating = true;

    this.renewalsService
      .createRenewal(this.newRenewal)
      .subscribe({

        next: (created: Renewal) => {

          console.log(
            'Renewal created:',
            created
          );

          this.creating = false;

          this.showCreateForm = false;

          this.createSuccess =
            'Renewal created successfully.';

          document.body.style.overflow = '';

          this.loadRenewals();

          setTimeout(() => {

            this.createSuccess = '';

            this.cdr.detectChanges();

          }, 4000);

        },

        error: (error: any) => {

          console.error(
            'Error creating renewal:',
            error
          );

          this.creating = false;

          this.createError =
            error.error?.detail ||
            'Unable to create renewal.';

          this.cdr.detectChanges();

        }

      });

  }

  // =========================
  // EDIT
  // =========================

  editRenewal(renewal: Renewal): void {

    this.editingRenewal = renewal;

    this.showEditForm = true;

    this.editErrorMessage = '';

    this.editForm = {

      assigned_to:
        renewal.assigned_to,

      renewal_date:
        renewal.renewal_date
          ? renewal.renewal_date.substring(0, 10)
          : '',

      notice_days:
        renewal.notice_days,

      status:
        renewal.status,

      new_expiry_date:
        renewal.new_expiry_date
          ? renewal.new_expiry_date.substring(0, 10)
          : null,

      notes:
        renewal.notes || '',

      previous_expiry_date:
        renewal.previous_expiry_date
          ? renewal.previous_expiry_date.substring(0, 10)
          : ''

    };

    document.body.style.overflow = 'hidden';

  }

  closeEditForm(): void {

    this.showEditForm = false;

    this.editingRenewal = null;

    this.editErrorMessage = '';

    this.saving = false;

    document.body.style.overflow = '';

  }

  saveRenewal(): void {

    if (!this.editingRenewal) {
      return;
    }

    this.editErrorMessage = '';

    if (
      !this.editForm.assigned_to ||
      !this.editForm.renewal_date ||
      !this.editForm.previous_expiry_date
    ) {

      this.editErrorMessage =
        'Please fill in all required fields.';

      return;
    }

    this.saving = true;

    this.renewalsService
      .updateRenewal(
        this.editingRenewal.id,
        this.editForm
      )
      .subscribe({

        next: (updated: Renewal) => {

          console.log(
            'Renewal updated:',
            updated
          );

          this.saving = false;

          this.closeEditForm();

          this.loadRenewals();

        },

        error: (error: any) => {

          console.error(
            'Error updating renewal:',
            error
          );

          this.saving = false;

          this.editErrorMessage =
            error.error?.detail ||
            'Unable to update renewal.';

          this.cdr.detectChanges();

        }

      });

  }

}