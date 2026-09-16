import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RenewalService, RenewalModel } from '../../core/services/renewal.service';
import { ContractService, ContractModel } from '../../core/services/contract.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-renewals-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatFormFieldModule,
    MatMenuModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">Renewal Management</h1>
          <p class="page-subtitle">Expirations tracking, renewal schedules, and contract extensions.</p>
        </div>
        <button mat-flat-button color="primary" (click)="showCreateForm = !showCreateForm">
          <mat-icon>{{ showCreateForm ? 'close' : 'add' }}</mat-icon>
          <span>{{ showCreateForm ? 'Cancel' : 'Initiate Renewal' }}</span>
        </button>
      </div>

      <!-- Create Renewal Form Panel -->
      <mat-card *ngIf="showCreateForm" class="mb-6 p-4">
        <mat-card-header>
          <mat-card-title>Initiate Contract Renewal</mat-card-title>
        </mat-card-header>
        <mat-card-content class="pt-4">
          <form [formGroup]="renewalForm" (ngSubmit)="onCreateSubmit()" class="grid-form">
            <mat-form-field appearance="outline">
              <mat-label>Target Contract</mat-label>
              <mat-select formControlName="contract_id">
                <mat-option *ngFor="let c of contracts" [value]="c.id || c.contract_id">
                  {{ c.contract_number }} — {{ c.title }}
                </mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Renewal Target Date</mat-label>
              <input matInput type="date" formControlName="renewal_date">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Previous Expiry Date</mat-label>
              <input matInput type="date" formControlName="previous_expiry_date">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>New Expiry Date</mat-label>
              <input matInput type="date" formControlName="new_expiry_date">
            </mat-form-field>

            <mat-form-field appearance="outline" class="col-span-full">
              <mat-label>Renewal Notes</mat-label>
              <textarea matInput formControlName="notes" rows="2" placeholder="Terms for annual renewal..."></textarea>
            </mat-form-field>

            <div class="col-span-full flex justify-end gap-2">
              <button mat-button type="button" (click)="showCreateForm = false">Cancel</button>
              <button mat-raised-button color="primary" type="submit" [disabled]="renewalForm.invalid || isSubmitting">
                Save Renewal Schedule
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>

      <!-- Loading State -->
      <div *ngIf="isLoading" class="flex justify-center p-12">
        <mat-spinner diameter="40"></mat-spinner>
      </div>

      <!-- Renewals Table -->
      <mat-card *ngIf="!isLoading">
        <div class="table-container">
          <div *ngIf="renewals.length === 0" class="p-8 text-center text-slate-500">
            <mat-icon class="text-4xl">event_busy</mat-icon>
            <p>No renewals recorded in system.</p>
          </div>

          <table mat-table [dataSource]="renewals" *ngIf="renewals.length > 0" class="w-full">
            <ng-container matColumnDef="contract_id">
              <th mat-header-cell *matHeaderCellDef>Contract #</th>
              <td mat-cell *matCellDef="let element">
                <strong>CNT-{{ element.contract_id }}</strong>
              </td>
            </ng-container>

            <ng-container matColumnDef="renewal_date">
              <th mat-header-cell *matHeaderCellDef>Renewal Date</th>
              <td mat-cell *matCellDef="let element">{{ element.renewal_date || '-' }}</td>
            </ng-container>

            <ng-container matColumnDef="previous_expiry_date">
              <th mat-header-cell *matHeaderCellDef>Prev Expiry Date</th>
              <td mat-cell *matCellDef="let element">{{ element.previous_expiry_date || '-' }}</td>
            </ng-container>

            <ng-container matColumnDef="new_expiry_date">
              <th mat-header-cell *matHeaderCellDef>New Expiry Date</th>
              <td mat-cell *matCellDef="let element">{{ element.new_expiry_date || '-' }}</td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let element">
                <span class="badge" [ngClass]="getBadgeClass(element.status)">
                  {{ element.status }}
                </span>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let element">
                <button mat-icon-button [matMenuTriggerFor]="statusMenu">
                  <mat-icon>edit</mat-icon>
                </button>
                <mat-menu #statusMenu="matMenu">
                  <button mat-menu-item (click)="updateStatus(element, 'In Progress')">
                    <mat-icon>hourglass_top</mat-icon>
                    <span>In Progress</span>
                  </button>
                  <button mat-menu-item (click)="updateStatus(element, 'Renewed')">
                    <mat-icon color="primary">task_alt</mat-icon>
                    <span>Renewed</span>
                  </button>
                  <button mat-menu-item (click)="updateStatus(element, 'Expired')">
                    <mat-icon color="warn">cancel</mat-icon>
                    <span>Expired</span>
                  </button>
                </mat-menu>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
        </div>
      </mat-card>
    </div>
  `,
  styles: [`
    .page-container { display: flex; flex-direction: column; gap: 16px; }
    .page-header { display: flex; justify-content: space-between; align-items: center; }
    .page-title { font-size: 1.5rem; font-weight: 800; margin: 0; }
    .page-subtitle { color: #64748b; font-size: 0.875rem; margin-top: 4px; }
    .grid-form { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; }
    .col-span-full { grid-column: 1 / -1; }
    .w-full { width: 100%; }
    .mb-6 { margin-bottom: 24px; }
    .p-4 { padding: 16px; }
    .p-8 { padding: 32px; }
  `]
})
export class RenewalsComponent implements OnInit {
  renewals: RenewalModel[] = [];
  contracts: ContractModel[] = [];
  isLoading = true;
  showCreateForm = false;
  isSubmitting = false;

  displayedColumns: string[] = ['contract_id', 'renewal_date', 'previous_expiry_date', 'new_expiry_date', 'status', 'actions'];
  renewalForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private renewalService: RenewalService,
    private contractService: ContractService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadData();
  }

  private initForm(): void {
    this.renewalForm = this.fb.group({
      contract_id: [1, Validators.required],
      renewal_date: ['2026-10-15'],
      previous_expiry_date: ['2026-10-30'],
      new_expiry_date: ['2027-10-30'],
      notes: ['']
    });
  }

  loadData(): void {
    this.isLoading = true;
    this.contractService.getContracts().subscribe(contracts => {
      this.contracts = contracts || [];
      if (this.contracts.length > 0) {
        const firstId = this.contracts[0].id || this.contracts[0].contract_id;
        this.renewalForm.patchValue({ contract_id: firstId });
      }

      this.renewalService.getRenewals().subscribe({
        next: (data) => {
          this.renewals = data || [];
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
          this.notificationService.showError('Failed to fetch renewals.');
        }
      });
    });
  }

  onCreateSubmit(): void {
    if (this.renewalForm.invalid) return;
    this.isSubmitting = true;

    this.renewalService.createRenewal(this.renewalForm.value).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.showCreateForm = false;
        this.notificationService.showSuccess('Renewal schedule saved!');
        this.loadData();
      },
      error: (err) => {
        this.isSubmitting = false;
        this.notificationService.showError(err.error?.detail || 'Failed to create renewal.');
      }
    });
  }

  updateStatus(item: RenewalModel, targetStatus: string): void {
    const id = item.id || item.renewal_id;
    if (!id) return;

    this.renewalService.updateStatus(id, targetStatus).subscribe({
      next: () => {
        this.notificationService.showSuccess(`Renewal status set to ${targetStatus}`);
        this.loadData();
      },
      error: () => this.notificationService.showError('Failed to update status.')
    });
  }

  getBadgeClass(status: string): string {
    switch (status) {
      case 'Renewed': return 'badge-active';
      case 'Upcoming': return 'badge-review';
      case 'In Progress': return 'badge-approved';
      case 'Expired': return 'badge-expired';
      default: return 'badge-draft';
    }
  }
}
