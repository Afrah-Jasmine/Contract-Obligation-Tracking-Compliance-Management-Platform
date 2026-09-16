import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { FormsModule } from '@angular/forms';

import { RenewalsService } from '../services/renewals.service';


@Component({
  selector: 'app-renewals',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './renewals.html',
  styleUrl: './renewals.css'
})


export class Renewals implements OnInit {

  // ===============================
  // RENEWALS DATA
  // ===============================

  renewals: any[] = [];

  isLoading = false;

  errorMessage = '';

  successMessage = '';
// ===============================
// CREATE RENEWAL
// ===============================

showCreateForm = false;

newRenewal: any = {
  contract_id: '',
  previous_expiry_date: '',
  new_expiry_date: '',
  renewal_date: '',
  assigned_to: '',
  status: 'Upcoming',
  notes: ''
};
// ===============================
// SEARCH & FILTER
// ===============================

searchText = '';

statusFilter = '';
// ===============================
// EDIT RENEWAL
// ===============================

editingRenewalId: number | null = null;

editRenewal: any = {
  contract_id: '',
  previous_expiry_date: '',
  new_expiry_date: '',
  renewal_date: '',
  assigned_to: '',
  notes: ''
};
  constructor(
    private renewalsService: RenewalsService,
    private cdr: ChangeDetectorRef
  ) {}


  // ===============================
  // INITIALIZE
  // ===============================

  ngOnInit(): void {

    this.loadRenewals();

  }


  // ===============================
  // LOAD RENEWALS
  // ===============================

  loadRenewals(): void {

    this.isLoading = true;

    this.errorMessage = '';


    this.renewalsService
      .getRenewals()
      .subscribe({

        next: (data: any[]) => {

          console.log(
            'Renewals:',
            data
          );

          this.renewals = data;

          this.isLoading = false;

          this.cdr.detectChanges();

        },


        error: (error: any) => {

          console.error(
            'Error loading renewals:',
            error
          );

          this.isLoading = false;


          if (error.status === 401) {

            this.errorMessage =
              'Session expired. Please login again.';

          }

          else if (error.status === 403) {

            this.errorMessage =
              'You do not have permission to view renewals.';

          }

          else {

            this.errorMessage =
              'Unable to load renewals. Please try again.';

          }


          this.cdr.detectChanges();

        }

      });

  }
  // ===============================
// FILTERED RENEWALS
// ===============================

get filteredRenewals(): any[] {

  return this.renewals.filter((renewal: any) => {

    const search =
      this.searchText
        .toLowerCase()
        .trim();

    const matchesSearch =
      !search ||

      String(renewal.contract_id || '')
        .includes(search) ||

      String(renewal.assigned_to || '')
        .includes(search) ||

      String(renewal.notes || '')
        .toLowerCase()
        .includes(search);

    const matchesStatus =
      !this.statusFilter ||
      renewal.status === this.statusFilter;

    return matchesSearch && matchesStatus;

  });

}
// ===============================
// START EDIT
// ===============================

startEdit(renewal: any): void {

  this.errorMessage = '';
  this.successMessage = '';

  this.editingRenewalId = renewal.id;

  this.editRenewal = {

    contract_id: renewal.contract_id,

    previous_expiry_date:
      renewal.previous_expiry_date || '',

    new_expiry_date:
      renewal.new_expiry_date || '',

    renewal_date:
      renewal.renewal_date || '',

    assigned_to:
      renewal.assigned_to || '',

    notes:
      renewal.notes || ''

  };

}


// ===============================
// UPDATE RENEWAL
// ===============================

updateRenewal(): void {

  this.errorMessage = '';
  this.successMessage = '';

  if (this.editingRenewalId === null) {
    return;
  }

  this.renewalsService
    .updateRenewal(
      this.editingRenewalId,
      this.editRenewal
    )
    .subscribe({

      next: (data: any) => {

        console.log(
          'Renewal updated:',
          data
        );

        this.successMessage =
          'Renewal updated successfully.';

        this.editingRenewalId = null;

        this.editRenewal = {

          contract_id: '',
          previous_expiry_date: '',
          new_expiry_date: '',
          renewal_date: '',
          assigned_to: '',
          notes: ''

        };

        this.loadRenewals();

      },

      error: (error: any) => {

        console.error(
          'Error updating renewal:',
          error
        );

        this.errorMessage =
          error.error?.detail ||
          'Unable to update renewal.';

      }

    });

}
// ===============================
// DELETE RENEWAL
// ===============================

deleteRenewal(renewalId: number): void {

  const confirmed = window.confirm(
    'Are you sure you want to delete this renewal?'
  );

  if (!confirmed) {
    return;
  }

  this.errorMessage = '';
  this.successMessage = '';

  this.renewalsService
    .deleteRenewal(renewalId)
    .subscribe({

      next: () => {

        console.log(
          'Renewal deleted:',
          renewalId
        );

        this.successMessage =
          'Renewal deleted successfully.';

        this.loadRenewals();

      },

      error: (error: any) => {

        console.error(
          'Error deleting renewal:',
          error
        );

        this.errorMessage =
          error.error?.detail ||
          'Unable to delete renewal.';

      }

    });

}
// ===============================
// UPDATE RENEWAL STATUS
// ===============================

updateStatus(
  renewalId: number,
  status: string
): void {

  this.errorMessage = '';
  this.successMessage = '';

  this.renewalsService
    .updateRenewalStatus(
      renewalId,
      status
    )
    .subscribe({

      next: (data: any) => {

        console.log(
          'Renewal status updated:',
          data
        );

        this.successMessage =
          'Renewal status updated successfully.';

        this.loadRenewals();

      },

      error: (error: any) => {

        console.error(
          'Error updating renewal status:',
          error
        );

        this.errorMessage =
          error.error?.detail ||
          'Unable to update renewal status.';

      }

    });

}
  // ===============================
// CREATE RENEWAL
// ===============================

createRenewal(): void {

  this.errorMessage = '';
  this.successMessage = '';

  if (
    !this.newRenewal.contract_id ||
    !this.newRenewal.renewal_date
  ) {

    this.errorMessage =
      'Please fill all required fields.';

    return;
  }

  this.renewalsService
    .createRenewal(this.newRenewal)
    .subscribe({

      next: (data: any) => {

        console.log(
          'Renewal created:',
          data
        );

        this.successMessage =
          'Renewal created successfully.';

        this.showCreateForm = false;

        this.newRenewal = {
          contract_id: '',
          previous_expiry_date: '',
          new_expiry_date: '',
          renewal_date: '',
          assigned_to: '',
          status: 'Upcoming',
          notes: ''
        };

        this.loadRenewals();

      },

      error: (error: any) => {

        console.error(
          'Error creating renewal:',
          error
        );

        this.errorMessage =
          error.error?.detail ||
          'Unable to create renewal.';

      }

    });

}

}