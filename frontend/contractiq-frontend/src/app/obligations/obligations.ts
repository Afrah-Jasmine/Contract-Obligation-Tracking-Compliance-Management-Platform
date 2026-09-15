import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import {
  Obligation,
  ObligationCreate,
  ObligationUpdate,
  ObligationService
} from '../services/obligation';

import {
  Contract,
  ContractService
} from '../services/contract';


@Component({
  selector: 'app-obligations',
  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatTooltipModule
  ],

  templateUrl: './obligations.html',
  styleUrl: './obligations.less'
})
export class Obligations implements OnInit {

  // =========================================
  // OBLIGATION DATA
  // =========================================

  obligations: Obligation[] = [];
  filteredObligations: Obligation[] = [];


  // =========================================
  // CONTRACT DATA
  // =========================================

  contracts: Contract[] = [];


  // =========================================
  // FILTERS
  // =========================================

  searchText = '';
  selectedStatus = 'All';


  // =========================================
  // UI STATE
  // =========================================

  loading = false;
  errorMessage = '';

  showCreateForm = false;
  creating = false;
  createError = '';
  createSuccess = '';


  // =========================================
  // VIEW MODAL
  // =========================================

  showViewModal = false;
  selectedObligation: Obligation | null = null;


  // =========================================
  // EDIT MODAL
  // =========================================

  showEditModal = false;
  editing = false;
  editError = '';
  editSuccess = '';

  editObligationData: ObligationUpdate = {
    title: '',
    description: '',
    obligation_type: 'Reporting Requirement',
    due_date: '',
    assigned_to: 0
  };


  // =========================================
  // CREATE FORM
  // =========================================

  newObligation: ObligationCreate = {
    contract_id: 0,
    title: '',
    description: '',
    obligation_type: 'Reporting Requirement',
    due_date: '',
    assigned_to: 0
  };


  // =========================================
  // OBLIGATION TYPES
  // =========================================

  obligationTypes = [
    'Payment Obligation',
    'Delivery Commitment',
    'Reporting Requirement',
    'Renewal Condition',
    'Service Level Agreement',
    'Legal Compliance Requirement'
  ];


  // =========================================
  // CONSTRUCTOR
  // =========================================

  constructor(
    private obligationService: ObligationService,
    private contractService: ContractService,
    private cdr: ChangeDetectorRef
  ) {}


  // =========================================
  // INITIALIZATION
  // =========================================

  ngOnInit(): void {

    this.loadObligations();
    this.loadContracts();

  }


  // =========================================
  // LOAD OBLIGATIONS
  // =========================================

  loadObligations(): void {

    this.loading = true;
    this.errorMessage = '';

    this.obligationService.getObligations().subscribe({

      next: (data) => {

        console.log(
          'Obligations API data:',
          data
        );

        this.obligations = data || [];

        this.applyFilters();

        this.loading = false;

        this.cdr.detectChanges();

      },

      error: (error) => {

        console.error(
          'Failed to load obligations:',
          error
        );

        this.loading = false;

        if (error?.status === 401) {

          this.errorMessage =
            'Your session has expired. Please login again.';

        } else if (error?.status === 403) {

          this.errorMessage =
            'You are not authorized to view obligations.';

        } else if (error?.status === 0) {

          this.errorMessage =
            'Unable to connect to the backend server.';

        } else {

          this.errorMessage =
            'Unable to load obligations. Please try again.';

        }

        this.cdr.detectChanges();

      }

    });

  }


  // =========================================
  // LOAD CONTRACTS
  // =========================================

  loadContracts(): void {

    this.contractService.getContracts().subscribe({

      next: (data) => {

        console.log(
          'Contracts for obligation form:',
          data
        );

        this.contracts = data || [];

        this.cdr.detectChanges();

      },

      error: (error) => {

        console.error(
          'Failed to load contracts:',
          error
        );

      }

    });

  }


  // =========================================
  // SEARCH + STATUS FILTER
  // =========================================

  applyFilters(): void {

    const search =
      this.searchText
        .trim()
        .toLowerCase();

    this.filteredObligations =
      this.obligations.filter((obligation) => {

        const title =
          obligation.title
            ?.toLowerCase() ?? '';

        const type =
          obligation.obligation_type
            ?.toLowerCase() ?? '';

        const status =
          obligation.status
            ?.toLowerCase() ?? '';

        const contractId =
          String(obligation.contract_id);

        const assignedTo =
          String(obligation.assigned_to);

        const matchesSearch =
          !search ||
          title.includes(search) ||
          type.includes(search) ||
          status.includes(search) ||
          contractId.includes(search) ||
          assignedTo.includes(search);

        const matchesStatus =
          this.selectedStatus === 'All' ||
          obligation.status === this.selectedStatus;

        return (
          matchesSearch &&
          matchesStatus
        );

      });

    this.cdr.detectChanges();

  }


  // =========================================
  // CLEAR FILTERS
  // =========================================

  clearFilters(): void {

    this.searchText = '';
    this.selectedStatus = 'All';

    this.applyFilters();

  }


  // =========================================
  // OPEN CREATE FORM
  // =========================================

  openCreateForm(): void {

    this.showCreateForm = true;

    this.createError = '';
    this.createSuccess = '';

    this.resetCreateForm();

  }


  // =========================================
  // CLOSE CREATE FORM
  // =========================================

  closeCreateForm(): void {

    this.showCreateForm = false;

    this.createError = '';
    this.createSuccess = '';

    this.resetCreateForm();

  }


  // =========================================
  // RESET CREATE FORM
  // =========================================

  resetCreateForm(): void {

    this.newObligation = {

      contract_id: 0,

      title: '',

      description: '',

      obligation_type:
        'Reporting Requirement',

      due_date: '',

      assigned_to: 0

    };

  }


  // =========================================
  // CREATE OBLIGATION
  // =========================================

  createObligation(): void {

    this.createError = '';
    this.createSuccess = '';

    if (
      !this.newObligation.contract_id ||
      !this.newObligation.title.trim() ||
      !this.newObligation.obligation_type ||
      !this.newObligation.due_date ||
      !this.newObligation.assigned_to
    ) {

      this.createError =
        'Please fill in all required fields.';

      return;

    }


    this.creating = true;


    const data: ObligationCreate = {

      contract_id:
        Number(this.newObligation.contract_id),

      title:
        this.newObligation.title.trim(),

      description:
        this.newObligation.description?.trim() || null,

      obligation_type:
        this.newObligation.obligation_type,

      due_date:
        this.newObligation.due_date,

      assigned_to:
        Number(this.newObligation.assigned_to)

    };


    this.obligationService
      .createObligation(data)
      .subscribe({

        next: (response) => {

          console.log(
            'Obligation created:',
            response
          );

          this.creating = false;

          this.createSuccess =
            'Obligation created successfully.';

          this.loadObligations();

          setTimeout(() => {

            this.showCreateForm = false;

            this.createSuccess = '';

            this.resetCreateForm();

            this.cdr.detectChanges();

          }, 800);

        },


        error: (error) => {

          console.error(
            'Failed to create obligation:',
            error
          );

          this.creating = false;

          if (error?.status === 404) {

            this.createError =
              error.error?.detail ||
              'Contract or assigned user not found.';

          }
          else if (error?.status === 401) {

            this.createError =
              'Your session has expired. Please login again.';

          }
          else if (error?.status === 403) {

            this.createError =
              'You are not authorized to create this obligation.';

          }
          else if (error?.status === 422) {

            this.createError =
              'Please check the entered information.';

          }
          else {

            this.createError =
              error.error?.detail ||
              'Unable to create obligation. Please try again.';

          }

          this.cdr.detectChanges();

        }

      });

  }


  // =========================================
  // VIEW OBLIGATION
  // =========================================

  viewObligation(
    obligation: Obligation
  ): void {

    this.selectedObligation = obligation;

    this.showViewModal = true;

    this.cdr.detectChanges();

  }


  // =========================================
  // CLOSE VIEW MODAL
  // =========================================

  closeViewModal(): void {

    this.showViewModal = false;

    this.selectedObligation = null;

    this.cdr.detectChanges();

  }


  // =========================================
  // EDIT OBLIGATION
  // =========================================

  editObligation(
    obligation: Obligation
  ): void {

    this.editError = '';
    this.editSuccess = '';

    this.selectedObligation = obligation;


    this.editObligationData = {

      title:
        obligation.title,

      description:
        obligation.description || '',

      obligation_type:
        obligation.obligation_type,

      due_date:
        obligation.due_date,

      assigned_to:
        obligation.assigned_to

    };


    this.showEditModal = true;

    this.cdr.detectChanges();

  }


  // =========================================
  // CLOSE EDIT MODAL
  // =========================================

  closeEditModal(): void {

    if (this.editing) {
      return;
    }

    this.showEditModal = false;

    this.selectedObligation = null;

    this.editError = '';
    this.editSuccess = '';

    this.cdr.detectChanges();

  }


  // =========================================
  // UPDATE OBLIGATION
  // =========================================

  updateObligation(): void {

    this.editError = '';
    this.editSuccess = '';


    if (!this.selectedObligation) {

      this.editError =
        'No obligation selected.';

      return;

    }


    if (
      !this.editObligationData.title?.trim() ||
      !this.editObligationData.obligation_type ||
      !this.editObligationData.due_date ||
      !this.editObligationData.assigned_to
    ) {

      this.editError =
        'Please fill in all required fields.';

      return;

    }


    this.editing = true;


    const data: ObligationUpdate = {

      title:
        this.editObligationData.title.trim(),

      description:
        this.editObligationData.description?.trim() || null,

      obligation_type:
        this.editObligationData.obligation_type,

      due_date:
        this.editObligationData.due_date,

      assigned_to:
        Number(this.editObligationData.assigned_to)

    };


    this.obligationService
      .updateObligation(
        this.selectedObligation.id,
        data
      )
      .subscribe({

        next: (response) => {

          console.log(
            'Obligation updated:',
            response
          );

          this.editing = false;

          this.editSuccess =
            'Obligation updated successfully.';


          // Update current table item immediately
          const index =
            this.obligations.findIndex(
              item =>
                item.id === response.id
            );


          if (index !== -1) {

            this.obligations[index] =
              response;

          }


          this.applyFilters();

          this.selectedObligation =
            response;


          this.cdr.detectChanges();


          // Close after short success message
          setTimeout(() => {

            this.showEditModal = false;

            this.selectedObligation = null;

            this.editSuccess = '';

            this.cdr.detectChanges();

          }, 900);

        },


        error: (error) => {

          console.error(
            'Failed to update obligation:',
            error
          );

          this.editing = false;


          if (error?.status === 404) {

            this.editError =
              error.error?.detail ||
              'Obligation, contract or assigned user was not found.';

          }
          else if (error?.status === 401) {

            this.editError =
              'Your session has expired. Please login again.';

          }
          else if (error?.status === 403) {

            this.editError =
              'You are not authorized to update this obligation.';

          }
          else if (error?.status === 422) {

            this.editError =
              'Please check the entered information.';

          }
          else {

            this.editError =
              error.error?.detail ||
              'Unable to update obligation. Please try again.';

          }

          this.cdr.detectChanges();

        }

      });

  }


  // =========================================
  // STATUS CSS CLASS
  // =========================================

  getStatusClass(
    status: string
  ): string {

    return status
      .toLowerCase()
      .replace(/\s+/g, '-');

  }


  // =========================================
  // CHECK OVERDUE
  // =========================================

  isOverdue(
    obligation: Obligation
  ): boolean {

    if (
      obligation.status === 'Completed' ||
      !obligation.due_date
    ) {

      return false;

    }


    const today =
      new Date();

    const dueDate =
      new Date(
        obligation.due_date
      );


    today.setHours(
      0,
      0,
      0,
      0
    );

    dueDate.setHours(
      0,
      0,
      0,
      0
    );


    return dueDate < today;

  }

}