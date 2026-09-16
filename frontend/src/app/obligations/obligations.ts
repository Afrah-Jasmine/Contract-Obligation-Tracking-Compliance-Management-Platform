import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { FormsModule } from '@angular/forms';

import { ObligationsService } from '../services/obligations.service';


@Component({
  selector: 'app-obligations',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './obligations.html',
  styleUrl: './obligations.css'
})


export class Obligations implements OnInit {

  // ===============================
  // OBLIGATIONS DATA
  // ===============================

  obligations: any[] = [];

  isLoading = false;

  errorMessage = '';

  successMessage = '';
  // ===============================
// EDIT OBLIGATION
// ===============================

editingObligationId: number | null = null;

editObligation: any = {
  contract_id: '',
  title: '',
  description: '',
  due_date: '',
  assigned_to: ''
};


  // ===============================
  // CREATE FORM
  // ===============================

  showCreateForm = false;


  newObligation: any = {

    contract_id: '',

    title: '',

    description: '',

    due_date: '',

    assigned_to: '',

    status: 'Pending'

  };


  // ===============================
  // SEARCH & FILTER
  // ===============================

  searchText = '';

  statusFilter = '';


  constructor(

    private obligationsService: ObligationsService,

    private cdr: ChangeDetectorRef

  ) {}


  // ===============================
  // INITIALIZE
  // ===============================

  ngOnInit(): void {

    this.loadObligations();

  }


  // ===============================
  // LOAD OBLIGATIONS
  // ===============================

  loadObligations(): void {

    this.isLoading = true;

    this.errorMessage = '';


    this.obligationsService
      .getObligations()
      .subscribe({

        next: (data: any[]) => {

          console.log(
            'Obligations:',
            data
          );

          this.obligations = data;

          this.isLoading = false;

          this.cdr.detectChanges();

        },


        error: (error: any) => {

          console.error(
            'Error loading obligations:',
            error
          );

          this.isLoading = false;


          if (error.status === 401) {

            this.errorMessage =
              'Session expired. Please login again.';

          }

          else if (error.status === 403) {

            this.errorMessage =
              'You do not have permission to view obligations.';

          }

          else {

            this.errorMessage =
              'Unable to load obligations. Please try again.';

          }


          this.cdr.detectChanges();

        }

      });

  }


  // ===============================
  // FILTERED OBLIGATIONS
  // ===============================

  get filteredObligations(): any[] {

    return this.obligations.filter(
      (obligation: any) => {

        const search =
          this.searchText
            .toLowerCase()
            .trim();


        const matchesSearch =
          !search ||

          String(
            obligation.title || ''
          )
          .toLowerCase()
          .includes(search)

          ||

          String(
            obligation.description || ''
          )
          .toLowerCase()
          .includes(search)

          ||

          String(
            obligation.contract_id || ''
          )
          .includes(search);


        const matchesStatus =
          !this.statusFilter ||

          obligation.status ===
          this.statusFilter;


        return (
          matchesSearch &&
          matchesStatus
        );

      }
    );

  }


  // ===============================
  // CREATE OBLIGATION
  // ===============================

  createObligation(): void {

    this.errorMessage = '';

    this.successMessage = '';


    if (

      !this.newObligation.contract_id ||

      !this.newObligation.title ||

      !this.newObligation.due_date

    ) {

      this.errorMessage =
        'Please fill all required fields.';

      return;

    }


    this.obligationsService
      .createObligation(this.newObligation)
      .subscribe({

        next: (data: any) => {

          console.log(
            'Obligation created:',
            data
          );


          this.successMessage =
            'Obligation created successfully.';


          this.showCreateForm = false;


          this.newObligation = {

            contract_id: '',

            title: '',

            description: '',

            due_date: '',

            assigned_to: '',

            status: 'Pending'

          };


          this.loadObligations();

        },


        error: (error: any) => {

          console.error(
            'Error creating obligation:',
            error
          );


          this.errorMessage =
            error.error?.detail ||

            'Unable to create obligation.';

        }

      });

  }
  // ===============================
// EDIT OBLIGATION
// ===============================

startEdit(obligation: any): void {

  this.errorMessage = '';
  this.successMessage = '';

  this.editingObligationId = obligation.id;

  this.editObligation = {

    contract_id: obligation.contract_id,

    title: obligation.title,

    description: obligation.description || '',

    due_date: obligation.due_date,

    assigned_to: obligation.assigned_to || ''

  };

}


// ===============================
// UPDATE OBLIGATION
// ===============================

updateObligation(): void {

  this.errorMessage = '';
  this.successMessage = '';

  if (this.editingObligationId === null) {
    return;
  }

  this.obligationsService
    .updateObligation(
      this.editingObligationId,
      this.editObligation
    )
    .subscribe({

      next: (data: any) => {

        console.log(
          'Obligation updated:',
          data
        );

        this.successMessage =
          'Obligation updated successfully.';

        this.editingObligationId = null;

        this.editObligation = {
          contract_id: '',
          title: '',
          description: '',
          due_date: '',
          assigned_to: ''
        };

        this.loadObligations();

      },

      error: (error: any) => {

        console.error(
          'Error updating obligation:',
          error
        );

        this.errorMessage =
          error.error?.detail ||
          'Unable to update obligation.';

      }

    });

}
// ===============================
// DELETE OBLIGATION
// ===============================

deleteObligation(obligationId: number): void {

  const confirmed =
    window.confirm(
      'Are you sure you want to delete this obligation?'
    );

  if (!confirmed) {
    return;
  }

  this.errorMessage = '';
  this.successMessage = '';

  this.obligationsService
    .deleteObligation(obligationId)
    .subscribe({

      next: () => {

        console.log(
          'Obligation deleted:',
          obligationId
        );

        this.successMessage =
          'Obligation deleted successfully.';

        this.loadObligations();

      },

      error: (error: any) => {

        console.error(
          'Error deleting obligation:',
          error
        );

        this.errorMessage =
          error.error?.detail ||
          'Unable to delete obligation.';

      }

    });

}


  // ===============================
  // UPDATE STATUS
  // ===============================

  updateStatus(
    obligationId: number,
    status: string
  ): void {

    this.errorMessage = '';

    this.successMessage = '';


    this.obligationsService
      .updateObligationStatus(
        obligationId,
        status
      )
      .subscribe({

        next: (data: any) => {

          console.log(
            'Obligation status updated:',
            data
          );


          this.successMessage =
            'Obligation status updated successfully.';


          this.loadObligations();

        },


        error: (error: any) => {

          console.error(
            'Error updating obligation:',
            error
          );


          this.errorMessage =
            error.error?.detail ||

            'Unable to update obligation status.';

        }

      });

  }

}