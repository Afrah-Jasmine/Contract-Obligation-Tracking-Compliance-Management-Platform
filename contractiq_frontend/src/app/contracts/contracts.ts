import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize, timeout } from 'rxjs';

import {
  ContractsService,
  Contract,
  CreateContractRequest,
  UpdateContractRequest
} from '../services/contracts';

@Component({
  selector: 'app-contracts',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './contracts.html',
  styleUrl: './contracts.css'
})
export class Contracts implements OnInit {

  /* =========================================================
     CONTRACT DATA
     ========================================================= */

  contracts: Contract[] = [];

  loading = false;
  errorMessage = '';

  /* =========================================================
     CREATE
     ========================================================= */

  showCreateForm = false;
  creating = false;

  createError = '';
  createSuccess = '';

  newContract: CreateContractRequest = {
    contract_code: '',
    title: '',
    description: '',
    counterparty: '',
    category: '',
    department: null,
    status: 'Draft',
    risk_level: 'Medium',
    start_date: '',
    end_date: '',
    assigned_to: null
  };

  /* =========================================================
     EDIT
     ========================================================= */

  showEditForm = false;
  saving = false;

  editErrorMessage = '';

  editingContract: Contract | null = null;

  editForm: UpdateContractRequest = {
    contract_code: '',
    title: '',
    description: '',
    counterparty: '',
    category: '',
    department: null,
    risk_level: 'Medium',
    start_date: '',
    end_date: ''
  };

  constructor(
    private contractsService: ContractsService,
    private cdr: ChangeDetectorRef
  ) {}

  /* =========================================================
     INIT
     ========================================================= */

  ngOnInit(): void {
    this.loadContracts();
  }

  /* =========================================================
     LOAD CONTRACTS
     ========================================================= */

  loadContracts(): void {

    this.loading = true;
    this.errorMessage = '';

    this.contractsService
      .getContracts()
      .pipe(
        timeout(60000),
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({

        next: (data: Contract[]) => {

          this.contracts = Array.isArray(data)
            ? data
            : [];

        },

        error: (error: any) => {

          console.error(
            'Error loading contracts:',
            error
          );

          if (error.status === 401) {

            this.errorMessage =
              'Your session has expired. Please login again.';

          }
          else if (error.status === 403) {

            this.errorMessage =
              'You do not have permission to view contracts.';

          }
          else if (error.name === 'TimeoutError') {

            this.errorMessage =
              'Loading contracts is taking too long. Please try again.';

          }
          else if (error.status === 0) {

            this.errorMessage =
              'Unable to connect to the backend. Please make sure the server is running.';

          }
          else {

            this.errorMessage =
              error.error?.detail ||
              'Unable to load contracts. Please try again.';

          }

        }

      });

  }

  /* =========================================================
     CREATE FORM
     ========================================================= */

  openCreateForm(): void {

    this.showCreateForm = true;

    this.createError = '';
    this.createSuccess = '';

    this.resetCreateForm();

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });

  }

  cancelCreate(): void {

    this.showCreateForm = false;

    this.createError = '';

    this.resetCreateForm();

  }

  resetCreateForm(): void {

    this.newContract = {
      contract_code: '',
      title: '',
      description: '',
      counterparty: '',
      category: '',
      department: null,
      status: 'Draft',
      risk_level: 'Medium',
      start_date: '',
      end_date: '',
      assigned_to: null
    };

  }

  /* =========================================================
     CREATE CONTRACT
     ========================================================= */

  createContract(): void {

    this.createError = '';
    this.createSuccess = '';

    /* Basic frontend validation */

    if (
      !this.newContract.contract_code ||
      !this.newContract.title ||
      !this.newContract.counterparty ||
      !this.newContract.category ||
      !this.newContract.start_date ||
      !this.newContract.end_date
    ) {

      this.createError =
        'Please fill in all required fields.';

      return;
    }

    if (
      this.newContract.end_date <
      this.newContract.start_date
    ) {

      this.createError =
        'End date cannot be earlier than start date.';

      return;
    }

    this.creating = true;

    this.contractsService
      .createContract(this.newContract)
      .subscribe({

        next: (createdContract: Contract) => {

          console.log(
            'Contract created:',
            createdContract
          );

          this.creating = false;

          this.createSuccess =
            `Contract ${createdContract.contract_code} created successfully.`;

          this.showCreateForm = false;

          this.resetCreateForm();

          this.loadContracts();

          /* Automatically hide success message */

          setTimeout(() => {
            this.createSuccess = '';
            this.cdr.detectChanges();
          }, 4000);

        },

        error: (error: any) => {

          console.error(
            'Error creating contract:',
            error
          );

          this.creating = false;

          this.createError =
            error.error?.detail ||
            'Unable to create contract. Please try again.';

          this.cdr.detectChanges();

        }

      });

  }

  /* =========================================================
     EDIT CONTRACT
     ========================================================= */

  editContract(contract: Contract): void {

    this.editingContract = contract;

    this.showEditForm = true;

    this.editErrorMessage = '';

    this.editForm = {

      contract_code: contract.contract_code,

      title: contract.title,

      description: contract.description || '',

      counterparty: contract.counterparty,

      category: contract.category,

      department: contract.department,

      risk_level: contract.risk_level,

      start_date: this.formatDate(
        contract.start_date
      ),

      end_date: this.formatDate(
        contract.end_date
      )

    };

    document.body.style.overflow = 'hidden';

  }

  /* =========================================================
     CLOSE EDIT
     ========================================================= */

  closeEditForm(): void {

    this.showEditForm = false;

    this.editingContract = null;

    this.editErrorMessage = '';

    document.body.style.overflow = '';

  }

  /* =========================================================
     SAVE CONTRACT
     ========================================================= */

  saveContract(): void {

    if (!this.editingContract) {
      return;
    }

    this.editErrorMessage = '';

    /* Basic validation */

    if (
      !this.editForm.contract_code ||
      !this.editForm.title ||
      !this.editForm.counterparty ||
      !this.editForm.category ||
      !this.editForm.start_date ||
      !this.editForm.end_date
    ) {

      this.editErrorMessage =
        'Please fill in all required fields.';

      return;
    }

    if (
      this.editForm.end_date <
      this.editForm.start_date
    ) {

      this.editErrorMessage =
        'End date cannot be earlier than start date.';

      return;
    }

    this.saving = true;

    this.contractsService
      .updateContract(
        this.editingContract.id,
        this.editForm
      )
      .subscribe({

        next: (updatedContract: Contract) => {

          console.log(
            'Contract updated:',
            updatedContract
          );

          this.saving = false;

          /* Update table immediately */

          const index =
            this.contracts.findIndex(
              c => c.id === updatedContract.id
            );

          if (index !== -1) {

            this.contracts[index] =
              updatedContract;

          }

          this.closeEditForm();

          this.cdr.detectChanges();

        },

        error: (error: any) => {

          console.error(
            'Error updating contract:',
            error
          );

          this.saving = false;

          this.editErrorMessage =
            error.error?.detail ||
            'Unable to update contract. Please try again.';

          this.cdr.detectChanges();

        }

      });

  }

  /* =========================================================
     DATE FORMAT
     ========================================================= */

  private formatDate(date: string): string {

    if (!date) {
      return '';
    }

    return date.substring(0, 10);

  }

}