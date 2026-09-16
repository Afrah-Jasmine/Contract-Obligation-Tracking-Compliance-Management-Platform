import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ContractsService } from '../services/contracts.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contracts',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './contracts.html',
  styleUrl: './contracts.css'
})
export class Contracts implements OnInit {

  contracts: any[] = [];
  
searchText = '';
statusFilter = '';
categoryFilter = '';

  isLoading = false;
  errorMessage = '';
  selectedContract: any = null;
showDetails = false;

  constructor(
    private contractsService: ContractsService,
    private cdr: ChangeDetectorRef
  ) {}
  showCreateForm = false;
  isEditMode = false;
editingContractId: number | null = null;

newContract: any = {
  contract_number: '',
  title: '',
  category: '',
  description: '',
  start_date: '',
  end_date: ''
};

successMessage = '';

  ngOnInit(): void {
    this.loadContracts();
  }

  loadContracts(): void {

    this.isLoading = true;
    this.errorMessage = '';

    this.contractsService.getContracts().subscribe({

      next: (data: any[]) => {

        console.log('Contracts:', data);

        this.contracts = data;

        this.isLoading = false;

        this.cdr.detectChanges();
      },

      error: (error: any) => {

        console.error('Error loading contracts:', error);

        this.isLoading = false;

        if (error.status === 401) {
          this.errorMessage =
            'Session expired. Please login again.';
        }
        else if (error.status === 403) {
          this.errorMessage =
            'You do not have permission to view contracts.';
        }
        else {
          this.errorMessage =
            'Unable to load contracts. Please try again.';
        }

        this.cdr.detectChanges();
      }

    });
  }

  refreshContracts(): void {
    this.loadContracts();
  }
  get filteredContracts(): any[] {

  const search = this.searchText
    .toLowerCase()
    .trim();

  return this.contracts.filter(contract => {

    const matchesSearch =
      !search ||
      contract.contract_number?.toLowerCase().includes(search) ||
      contract.title?.toLowerCase().includes(search) ||
      contract.category?.toLowerCase().includes(search) ||
      contract.status?.toLowerCase().includes(search);

    const matchesStatus =
      !this.statusFilter ||
      contract.status === this.statusFilter;

    const matchesCategory =
      !this.categoryFilter ||
      contract.category === this.categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });
}
  // ==============================
// CREATE CONTRACT
// ==============================

createContract(): void {

  this.errorMessage = '';
  this.successMessage = '';

  if (
    !this.newContract.contract_number ||
    !this.newContract.title ||
    !this.newContract.category ||
    !this.newContract.start_date ||
    !this.newContract.end_date
  ) {
    this.errorMessage = 'Please fill all required fields.';
    return;
  }

  if (this.newContract.start_date > this.newContract.end_date) {
    this.errorMessage =
      'Start date cannot be greater than end date.';
    return;
  }

  // UPDATE CONTRACT
  if (this.isEditMode && this.editingContractId !== null) {

    this.contractsService
      .updateContract(
        this.editingContractId,
        this.newContract
      )
      .subscribe({

        next: (data: any) => {

          console.log('Contract updated:', data);

          this.successMessage =
            'Contract updated successfully.';

          this.showCreateForm = false;
          this.isEditMode = false;
          this.editingContractId = null;

          this.newContract = {
            contract_number: '',
            title: '',
            category: '',
            description: '',
            start_date: '',
            end_date: ''
          };

          this.loadContracts();
        },

        error: (error: any) => {

          console.error(
            'Error updating contract:',
            error
          );

          this.errorMessage =
            error.error?.detail ||
            'Unable to update contract.';

        }

      });

    return;
  }

  // CREATE CONTRACT
  this.contractsService
    .createContract(this.newContract)
    .subscribe({

      next: (data: any) => {

        console.log('Contract created:', data);

        this.successMessage =
          'Contract created successfully.';

        this.showCreateForm = false;

        this.newContract = {
          contract_number: '',
          title: '',
          category: '',
          description: '',
          start_date: '',
          end_date: ''
        };

        this.loadContracts();
      },

      error: (error: any) => {

        console.error(
          'Error creating contract:',
          error
        );

        if (error.status === 400) {

          this.errorMessage =
            error.error?.detail ||
            'Contract number already exists.';

        }
        else if (error.status === 401) {

          this.errorMessage =
            'Session expired. Please login again.';

        }
        else {

          this.errorMessage =
            'Unable to create contract.';

        }

      }

    });
}
// ==============================
// SUBMIT FOR REVIEW
// ==============================

submitForReview(contractId: number): void {

  this.errorMessage = '';
  this.successMessage = '';

  this.contractsService
    .submitForReview(contractId)
    .subscribe({

      next: (data: any) => {

        console.log('Submitted for review:', data);

        this.successMessage =
          'Contract submitted for review successfully.';

        this.loadContracts();

      },

      error: (error: any) => {

        console.error(
          'Error submitting contract:',
          error
        );

        this.errorMessage =
          error.error?.detail ||
          'Unable to submit contract for review.';

      }

    });
}


// ==============================
// APPROVE CONTRACT
// ==============================

approveContract(contractId: number): void {

  this.errorMessage = '';
  this.successMessage = '';

  this.contractsService
    .approveContract(contractId)
    .subscribe({

      next: (data: any) => {

        console.log('Contract approved:', data);

        this.successMessage =
          'Contract approved successfully.';

        this.loadContracts();

      },

      error: (error: any) => {

        console.error(
          'Error approving contract:',
          error
        );

        this.errorMessage =
          error.error?.detail ||
          'Unable to approve contract.';

      }

    });
}
// ==============================
// ACTIVATE CONTRACT
// ==============================

activateContract(contractId: number): void {

  this.errorMessage = '';
  this.successMessage = '';

  this.contractsService
    .updateContractStatus(contractId, 'Active')
    .subscribe({

      next: (data: any) => {

        console.log('Contract activated:', data);

        this.successMessage =
          'Contract activated successfully.';

        this.loadContracts();

      },

      error: (error: any) => {

        console.error(
          'Error activating contract:',
          error
        );

        this.errorMessage =
          error.error?.detail ||
          'Unable to activate contract.';

      }

    });

}
// ==============================
// EDIT CONTRACT
// ==============================

editContract(contract: any): void {

  this.isEditMode = true;
  this.editingContractId = contract.id;
  this.showCreateForm = true;

  this.newContract = {
    contract_number: contract.contract_number,
    title: contract.title,
    category: contract.category,
    description: contract.description || '',
    start_date: contract.start_date,
    end_date: contract.end_date
  };

  this.errorMessage = '';
  this.successMessage = '';
}
// ==============================
// DELETE CONTRACT
// ==============================

deleteContract(contractId: number): void {

  const confirmed = confirm(
    'Are you sure you want to delete this contract?'
  );

  if (!confirmed) {
    return;
  }

  this.errorMessage = '';
  this.successMessage = '';

  this.contractsService
    .deleteContract(contractId)
    .subscribe({

      next: () => {

        this.successMessage =
          'Contract deleted successfully.';

        this.loadContracts();

      },

      error: (error: any) => {

        console.error(
          'Error deleting contract:',
          error
        );

        this.errorMessage =
          error.error?.detail ||
          'Unable to delete contract.';

      }

    });
}
viewContract(contract: any): void {
  this.selectedContract = contract;
  this.showDetails = true;
}
}