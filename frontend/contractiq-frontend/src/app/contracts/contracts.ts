import {
  Component,
  OnInit
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  MatTableModule
} from '@angular/material/table';

import {
  MatCardModule
} from '@angular/material/card';

import {
  MatButtonModule
} from '@angular/material/button';

import {
  MatFormFieldModule
} from '@angular/material/form-field';

import {
  MatInputModule
} from '@angular/material/input';

import {
  MatSelectModule
} from '@angular/material/select';

import {
  MatIconModule
} from '@angular/material/icon';

import {
  Contract,
  ContractService,
  CreateContract,
  UpdateContract
} from '../services/contract';


@Component({
  selector: 'app-contracts',
  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule
  ],

  templateUrl: './contracts.html',
  styleUrl: './contracts.less'
})
export class Contracts implements OnInit {

  // =====================================================
  // CONTRACT DATA
  // =====================================================

  contracts: Contract[] = [];

  filteredContracts: Contract[] = [];


  // =====================================================
  // FILTERS
  // =====================================================

  searchTerm = '';

  selectedCategory = '';

  selectedStatus = '';


  // =====================================================
  // DROPDOWN OPTIONS
  // =====================================================

  categories = [
    'Vendor Contract',
    'Service Agreement',
    'Employment Contract',
    'NDA',
    'Lease Agreement',
    'Partnership Agreement'
  ];

  statuses = [
    'Draft',
    'Under Review',
    'Approved',
    'Active',
    'Expired',
    'Terminated'
  ];


  // =====================================================
  // LOADING / ERROR
  // =====================================================

  loading = false;

  errorMessage = '';


  // =====================================================
  // CREATE FORM
  // =====================================================

  showCreateForm = false;

  creating = false;

  createError = '';

  createSuccessPopup = false;

  successMessage = '';

  private successToastTimer: ReturnType<typeof setTimeout> | null = null;


  createContractData: CreateContract = {

    contract_number: '',

    title: '',

    category: '',

    description: '',

    party_name: '',

    start_date: '',

    end_date: ''

  };


  // =====================================================
  // EDIT FORM
  // =====================================================

  showEditForm = false;

  editing = false;

  editError = '';

  selectedContract: Contract | null = null;


  editContractData: UpdateContract = {

    title: '',

    category: '',

    description: '',

    party_name: '',

    start_date: '',

    end_date: ''

  };


  // =====================================================
  // VIEW MODAL
  // =====================================================

  showViewModal = false;

  viewLoading = false;

  viewError = '';


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    private contractService: ContractService
  ) {}


  // =====================================================
  // INIT
  // =====================================================

  ngOnInit(): void {

    this.loadContracts();

  }


  // =====================================================
  // LOAD CONTRACTS
  // =====================================================

  loadContracts(): void {

    this.loading = true;

    this.errorMessage = '';

    this.contractService
      .getContracts()
      .subscribe({

        next: (data) => {

          console.log(
            'Contracts API data:',
            data
          );

          this.contracts = data || [];

          this.applyFilters();

          this.loading = false;

        },

        error: (error) => {

          console.error(
            'Failed to load contracts:',
            error
          );

          this.loading = false;

          if (error?.status === 401) {

            this.errorMessage =
              'Your session has expired. Please login again.';

          }
          else if (error?.status === 403) {

            this.errorMessage =
              'You are not authorized to view contracts.';

          }
          else if (error?.status === 0) {

            this.errorMessage =
              'Unable to connect to the backend server.';

          }
          else {

            this.errorMessage =
              'Unable to load contracts. Please try again.';

          }

        }

      });

  }


  // =====================================================
  // SEARCH
  // =====================================================

  onSearch(): void {

    this.applyFilters();

  }


  // =====================================================
  // APPLY FILTERS
  // =====================================================

  applyFilters(): void {

    const search =
      this.searchTerm
        .trim()
        .toLowerCase();


    this.filteredContracts =
      this.contracts.filter(
        (contract) => {

          const contractNumber =
            contract.contract_number
              ?.toLowerCase() || '';

          const title =
            contract.title
              ?.toLowerCase() || '';

          const party =
            contract.party_name
              ?.toLowerCase() || '';

          const category =
            contract.category
              ?.toLowerCase() || '';

          const status =
            contract.status
              ?.toLowerCase() || '';


          const matchesSearch =
            !search ||
            contractNumber.includes(search) ||
            title.includes(search) ||
            party.includes(search) ||
            category.includes(search) ||
            status.includes(search);


          const matchesCategory =
            !this.selectedCategory ||
            contract.category ===
              this.selectedCategory;


          const matchesStatus =
            !this.selectedStatus ||
            contract.status ===
              this.selectedStatus;


          return (
            matchesSearch &&
            matchesCategory &&
            matchesStatus
          );

        }
      );

  }


  // =====================================================
  // CLEAR FILTERS
  // =====================================================

  clearFilters(): void {

    this.searchTerm = '';

    this.selectedCategory = '';

    this.selectedStatus = '';

    this.applyFilters();

  }


  // =====================================================
  // OPEN CREATE FORM
  // =====================================================

  openCreateForm(): void {

    this.closeEditForm();

    this.showCreateForm = true;

    this.createError = '';

    this.resetCreateForm();

  }


  // =====================================================
  // CLOSE CREATE FORM
  // =====================================================

  closeCreateForm(): void {

    this.showCreateForm = false;

    this.createError = '';

    this.creating = false;

    this.resetCreateForm();

  }


  // =====================================================
  // RESET CREATE FORM
  // =====================================================

  resetCreateForm(): void {

    this.createContractData = {

      contract_number: '',

      title: '',

      category: '',

      description: '',

      party_name: '',

      start_date: '',

      end_date: ''

    };

  }


  // =====================================================
  // CREATE CONTRACT
  // =====================================================

  createContract(): void {

    this.createError = '';

    this.hideSuccessToast();


    // ---------------------------------------------
    // VALIDATION
    // ---------------------------------------------

    if (
      !this.createContractData.contract_number.trim() ||
      !this.createContractData.title.trim() ||
      !this.createContractData.category ||
      !this.createContractData.party_name.trim() ||
      !this.createContractData.start_date ||
      !this.createContractData.end_date
    ) {

      this.createError =
        'Please fill in all required fields.';

      return;

    }


    // ---------------------------------------------
    // DATE VALIDATION
    // ---------------------------------------------

    if (
      this.createContractData.end_date <
      this.createContractData.start_date
    ) {

      this.createError =
        'End date cannot be earlier than start date.';

      return;

    }


    // ---------------------------------------------
    // START LOADING
    // ---------------------------------------------

    this.creating = true;


    const data: CreateContract = {

      contract_number:
        this.createContractData
          .contract_number
          .trim(),

      title:
        this.createContractData
          .title
          .trim(),

      category:
        this.createContractData.category,

      description:
        this.createContractData
          .description
          ?.trim() || '',

      party_name:
        this.createContractData
          .party_name
          .trim(),

      start_date:
        this.createContractData.start_date,

      end_date:
        this.createContractData.end_date

    };


    // ---------------------------------------------
    // API CALL
    // ---------------------------------------------

    this.contractService
      .createContract(data)
      .subscribe({

        next: (response) => {

          console.log(
            'Contract created successfully:',
            response
          );


          this.creating = false;


          // ---------------------------------------
          // CLOSE FORM IMMEDIATELY
          // ---------------------------------------

          this.showCreateForm = false;


          // ---------------------------------------
          // RESET FORM
          // ---------------------------------------

          this.resetCreateForm();

          this.createError = '';


          // ---------------------------------------
          // SUCCESS TOAST
          // ---------------------------------------

          this.showSuccessToast(
            'Contract Created Successfully',
            'The new contract has been added to ContractIQ.'
          );


          // ---------------------------------------
          // REFRESH TABLE
          // ---------------------------------------

          this.loadContracts();

        },


        error: (error) => {

          console.error(
            'Failed to create contract:',
            error
          );


          this.creating = false;


          // ---------------------------------------
          // KEEP FORM OPEN ON ERROR
          // ---------------------------------------

          if (error?.status === 400) {

            this.createError =
              error.error?.detail ||
              'Invalid contract information.';

          }
          else if (error?.status === 401) {

            this.createError =
              'Your session has expired. Please login again.';

          }
          else if (error?.status === 403) {

            this.createError =
              'You are not authorized to create this contract.';

          }
          else if (error?.status === 409) {

            this.createError =
              error.error?.detail ||
              'A contract with this number already exists.';

          }
          else if (error?.status === 422) {

            this.createError =
              'Please check the entered information.';

          }
          else {

            this.createError =
              error.error?.detail ||
              'Unable to create contract. Please try again.';

          }

        }

      });

  }


  // =====================================================
  // EDIT CONTRACT
  // =====================================================

  editContract(id: number): void {

    this.editError = '';

    this.showCreateForm = false;

    this.showViewModal = false;

    this.editing = false;


    this.contractService
      .getContract(id)
      .subscribe({

        next: (contract) => {

          console.log(
            'Contract selected for edit:',
            contract
          );


          this.selectedContract = contract;


          this.editContractData = {

            title:
              contract.title || '',

            category:
              contract.category || '',

            description:
              contract.description || '',

            party_name:
              contract.party_name || '',

            start_date:
              contract.start_date || '',

            end_date:
              contract.end_date || ''

          };


          this.showEditForm = true;

        },


        error: (error) => {

          console.error(
            'Failed to load contract for edit:',
            error
          );


          if (error?.status === 401) {

            this.editError =
              'Your session has expired. Please login again.';

          }
          else if (error?.status === 403) {

            this.editError =
              'You are not authorized to edit this contract.';

          }
          else if (error?.status === 404) {

            this.editError =
              'Contract not found.';

          }
          else if (error?.status === 0) {

            this.editError =
              'Unable to connect to the backend server.';

          }
          else {

            this.editError =
              'Unable to load contract details.';

          }

          this.showEditForm = true;

        }

      });

  }


  // =====================================================
  // UPDATE CONTRACT
  // =====================================================

  updateContract(): void {

    this.editError = '';


    if (!this.selectedContract) {

      this.editError =
        'No contract selected for editing.';

      return;

    }


    // ---------------------------------------------
    // VALIDATION
    // ---------------------------------------------

    if (
      !this.editContractData.title.trim() ||
      !this.editContractData.category ||
      !this.editContractData.party_name.trim() ||
      !this.editContractData.start_date ||
      !this.editContractData.end_date
    ) {

      this.editError =
        'Please fill in all required fields.';

      return;

    }


    // ---------------------------------------------
    // DATE VALIDATION
    // ---------------------------------------------

    if (
      this.editContractData.end_date <
      this.editContractData.start_date
    ) {

      this.editError =
        'End date cannot be earlier than start date.';

      return;

    }


    this.editing = true;


    const contractId =
      this.selectedContract.id;


    const data: UpdateContract = {

      title:
        this.editContractData
          .title
          .trim(),

      category:
        this.editContractData.category,

      description:
        this.editContractData
          .description
          ?.trim() || '',

      party_name:
        this.editContractData
          .party_name
          .trim(),

      start_date:
        this.editContractData.start_date,

      end_date:
        this.editContractData.end_date

    };


    // ---------------------------------------------
    // API CALL
    // ---------------------------------------------

    this.contractService
      .updateContract(
        contractId,
        data
      )
      .subscribe({

        next: (response) => {

          console.log(
            'Contract updated successfully:',
            response
          );


          this.editing = false;


          // ---------------------------------------
          // CLOSE EDIT FORM IMMEDIATELY
          // ---------------------------------------

          this.showEditForm = false;


          // ---------------------------------------
          // RESET EDIT DATA
          // ---------------------------------------

          this.selectedContract = null;

          this.resetEditForm();

          this.editError = '';


          // ---------------------------------------
          // SUCCESS TOAST
          // ---------------------------------------

          this.showSuccessToast(
            'Contract Updated Successfully',
            'The contract information has been updated successfully.'
          );


          // ---------------------------------------
          // REFRESH TABLE
          // ---------------------------------------

          this.loadContracts();

        },


        error: (error) => {

          console.error(
            'Failed to update contract:',
            error
          );


          this.editing = false;


          // ---------------------------------------
          // KEEP EDIT FORM OPEN ON ERROR
          // ---------------------------------------------

          if (error?.status === 401) {

            this.editError =
              'Your session has expired. Please login again.';

          }
          else if (error?.status === 403) {

            this.editError =
              'You are not authorized to update this contract.';

          }
          else if (error?.status === 404) {

            this.editError =
              'Contract not found.';

          }
          else if (error?.status === 409) {

            this.editError =
              error.error?.detail ||
              'This contract information conflicts with an existing record.';

          }
          else if (error?.status === 422) {

            this.editError =
              'Please check the entered information.';

          }
          else if (error?.status === 0) {

            this.editError =
              'Unable to connect to the backend server.';

          }
          else {

            this.editError =
              error.error?.detail ||
              'Unable to update contract. Please try again.';

          }

        }

      });

  }


  // =====================================================
  // RESET EDIT FORM
  // =====================================================

  resetEditForm(): void {

    this.editContractData = {

      title: '',

      category: '',

      description: '',

      party_name: '',

      start_date: '',

      end_date: ''

    };

  }


  // =====================================================
  // CLOSE EDIT FORM
  // =====================================================

  closeEditForm(): void {

    this.showEditForm = false;

    this.editing = false;

    this.editError = '';

    this.selectedContract = null;

    this.resetEditForm();

  }


  // =====================================================
  // VIEW CONTRACT
  // =====================================================

  viewContract(id: number): void {

    this.showViewModal = true;

    this.viewLoading = true;

    this.viewError = '';

    this.selectedContract = null;


    this.contractService
      .getContract(id)
      .subscribe({

        next: (contract) => {

          console.log(
            'Contract details:',
            contract
          );


          this.selectedContract = contract;

          this.viewLoading = false;

        },


        error: (error) => {

          console.error(
            'Failed to load contract details:',
            error
          );


          this.viewLoading = false;


          if (error?.status === 401) {

            this.viewError =
              'Your session has expired. Please login again.';

          }
          else if (error?.status === 403) {

            this.viewError =
              'You are not authorized to view this contract.';

          }
          else if (error?.status === 404) {

            this.viewError =
              'Contract not found.';

          }
          else if (error?.status === 0) {

            this.viewError =
              'Unable to connect to the backend server.';

          }
          else {

            this.viewError =
              'Unable to load contract details. Please try again.';

          }

        }

      });

  }


  // =====================================================
  // CLOSE VIEW MODAL
  // =====================================================

  closeViewModal(): void {

    this.showViewModal = false;

    this.viewLoading = false;

    this.viewError = '';

    this.selectedContract = null;

  }


  // =====================================================
  // SUCCESS TOAST
  // =====================================================

  showSuccessToast(
    title: string,
    message: string
  ): void {

    // Clear previous timer
    if (this.successToastTimer) {

      clearTimeout(
        this.successToastTimer
      );

      this.successToastTimer = null;

    }


    this.successMessage =
      `${title}|${message}`;


    this.createSuccessPopup = true;


    // Auto hide after 3 seconds
    this.successToastTimer =
      setTimeout(() => {

        this.createSuccessPopup = false;

        this.successMessage = '';

        this.successToastTimer = null;

      }, 3000);

  }


  // =====================================================
  // HIDE SUCCESS TOAST
  // =====================================================

  hideSuccessToast(): void {

    this.createSuccessPopup = false;

    this.successMessage = '';


    if (this.successToastTimer) {

      clearTimeout(
        this.successToastTimer
      );

      this.successToastTimer = null;

    }

  }


  // =====================================================
  // STATUS CLASS
  // =====================================================

  getStatusClass(status: string): string {

    switch (status) {

      case 'Active':
        return 'active';

      case 'Draft':
        return 'draft';

      case 'Under Review':
        return 'under-review';

      case 'Approved':
        return 'approved';

      case 'Expired':
        return 'expired';

      case 'Terminated':
        return 'terminated';

      default:
        return 'default';

    }

  }

}