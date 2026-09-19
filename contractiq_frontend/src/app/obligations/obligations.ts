import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize, timeout } from 'rxjs';

import {
  ObligationsService,
  Obligation,
  CreateObligationRequest,
  UpdateObligationRequest
} from '../services/obligations';

@Component({
  selector: 'app-obligations',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './obligations.html',
  styleUrl: './obligations.css'
})
export class Obligations implements OnInit {

  obligations: Obligation[] = [];

  loading = false;
  errorMessage = '';

  /* CREATE */

  showCreateForm = false;
  creating = false;
  createError = '';
  createSuccess = '';

  newObligation: CreateObligationRequest = {
    contract_id: 0,
    title: '',
    description: '',
    obligation_type: '',
    due_date: '',
    assigned_to: 0,
    status: 'Pending',
    completion_date: null
  };

  /* EDIT */

  showEditForm = false;
  saving = false;
  editErrorMessage = '';

  editingObligation: Obligation | null = null;

  editForm: UpdateObligationRequest = {
    title: '',
    description: '',
    obligation_type: '',
    due_date: '',
    assigned_to: 0,
    status: 'Pending',
    completion_date: null
  };

  constructor(
    private obligationsService: ObligationsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadObligations();
  }

  /* LOAD OBLIGATIONS */

  loadObligations(): void {

    this.loading = true;
    this.errorMessage = '';

    this.obligationsService
      .getObligations()
      .pipe(
        timeout(60000),
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({

        next: (data: Obligation[]) => {

          this.obligations = Array.isArray(data)
            ? data
            : [];

        },

        error: (error: any) => {

          console.error(
            'Error loading obligations:',
            error
          );

          if (error.status === 401) {

            this.errorMessage =
              'Your session has expired. Please login again.';

          }
          else if (error.status === 403) {

            this.errorMessage =
              'You do not have permission to view obligations.';

          }
          else if (error.name === 'TimeoutError') {

            this.errorMessage =
              'Loading obligations is taking too long. Please try again.';

          }
          else if (error.status === 0) {

            this.errorMessage =
              'Unable to connect to the backend. Please make sure the server is running.';

          }
          else {

            this.errorMessage =
              error.error?.detail ||
              'Unable to load obligations. Please try again.';

          }

        }

      });
  }

  /* CREATE */

  openCreateForm(): void {

    this.showCreateForm = true;

    this.createError = '';
    this.createSuccess = '';

    this.newObligation = {
      contract_id: 0,
      title: '',
      description: '',
      obligation_type: '',
      due_date: '',
      assigned_to: 0,
      status: 'Pending',
      completion_date: null
    };

  }

  cancelCreate(): void {

    this.showCreateForm = false;
    this.createError = '';

  }

  createObligation(): void {

    this.createError = '';
    this.createSuccess = '';

    if (
      !this.newObligation.contract_id ||
      !this.newObligation.title ||
      !this.newObligation.obligation_type ||
      !this.newObligation.due_date ||
      !this.newObligation.assigned_to
    ) {

      this.createError =
        'Please fill in all required fields.';

      return;
    }

    this.creating = true;

    this.obligationsService
      .createObligation(this.newObligation)
      .subscribe({

        next: (created: Obligation) => {

          this.creating = false;

          this.createSuccess =
            `Obligation "${created.title}" created successfully.`;

          this.showCreateForm = false;

          this.loadObligations();

          setTimeout(() => {

            this.createSuccess = '';

            this.cdr.detectChanges();

          }, 4000);

        },

        error: (error: any) => {

          console.error(
            'Error creating obligation:',
            error
          );

          this.creating = false;

          this.createError =
            error.error?.detail ||
            'Unable to create obligation.';

          this.cdr.detectChanges();

        }

      });

  }

  /* EDIT */

  editObligation(obligation: Obligation): void {

    this.editingObligation = obligation;

    this.showEditForm = true;

    this.editErrorMessage = '';

    this.editForm = {

      title: obligation.title,

      description:
        obligation.description || '',

      obligation_type:
        obligation.obligation_type,

      due_date:
        obligation.due_date.substring(0, 10),

      assigned_to:
        obligation.assigned_to || 0,

      status:
        obligation.status,

      completion_date:
        obligation.completion_date
          ? obligation.completion_date.substring(0, 10)
          : null

    };

    document.body.style.overflow = 'hidden';

  }

  closeEditForm(): void {

    this.showEditForm = false;

    this.editingObligation = null;

    this.editErrorMessage = '';

    document.body.style.overflow = '';

  }

  saveObligation(): void {

    if (!this.editingObligation) {
      return;
    }

    this.editErrorMessage = '';

    if (
      !this.editForm.title ||
      !this.editForm.obligation_type ||
      !this.editForm.due_date ||
      !this.editForm.assigned_to
    ) {

      this.editErrorMessage =
        'Please fill in all required fields.';

      return;
    }

    this.saving = true;

    this.obligationsService
      .updateObligation(
        this.editingObligation.id,
        this.editForm
      )
      .subscribe({

        next: (updated: Obligation) => {

          this.saving = false;

          const index =
            this.obligations.findIndex(
              o => o.id === updated.id
            );

          if (index !== -1) {

            this.obligations[index] =
              updated;

          }

          this.closeEditForm();

          this.cdr.detectChanges();

        },

        error: (error: any) => {

          console.error(
            'Error updating obligation:',
            error
          );

          this.saving = false;

          this.editErrorMessage =
            error.error?.detail ||
            'Unable to update obligation.';

          this.cdr.detectChanges();

        }

      });

  }

}