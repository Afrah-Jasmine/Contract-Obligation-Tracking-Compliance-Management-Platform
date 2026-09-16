import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ContractService, ContractModel } from '../../core/services/contract.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-contracts-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatFormFieldModule,
    MatMenuModule,
    MatDialogModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">Contract Management</h1>
          <p class="page-subtitle">Repository, lifecycle workflows, status transitions, and user assignment.</p>
        </div>
        <button mat-flat-button color="primary" (click)="toggleCreateForm()">
          <mat-icon>{{ showCreateForm ? 'close' : 'add' }}</mat-icon>
          <span>{{ showCreateForm ? 'Cancel' : 'New Contract' }}</span>
        </button>
      </div>

      <!-- Create Contract Form Panel -->
      <mat-card *ngIf="showCreateForm" class="form-card mb-6">
        <mat-card-header>
          <mat-card-title>Create New Contract</mat-card-title>
        </mat-card-header>
        <mat-card-content class="pt-4">
          <form [formGroup]="contractForm" (ngSubmit)="onCreateSubmit()" class="grid-form">
            <mat-form-field appearance="outline">
              <mat-label>Contract Title</mat-label>
              <input matInput formControlName="title" placeholder="e.g. Master Service Agreement">
              <mat-error *ngIf="contractForm.get('title')?.hasError('required')">Title is required</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Contract Number</mat-label>
              <input matInput formControlName="contract_number" placeholder="e.g. CNT-2026-901">
              <mat-error *ngIf="contractForm.get('contract_number')?.hasError('required')">Contract number is required</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Category</mat-label>
              <mat-select formControlName="category">
                <mat-option value="Software">Software</mat-option>
                <mat-option value="Vendor Contract">Vendor Contract</mat-option>
                <mat-option value="Service Agreement">Service Agreement</mat-option>
                <mat-option value="Real Estate">Real Estate</mat-option>
                <mat-option value="Employment Contract">Employment Contract</mat-option>
                <mat-option value="Confidentiality Agreement">Confidentiality Agreement</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Start Date</mat-label>
              <input matInput type="date" formControlName="start_date">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>End Date</mat-label>
              <input matInput type="date" formControlName="end_date">
            </mat-form-field>

            <mat-form-field appearance="outline" class="col-span-full">
              <mat-label>Description</mat-label>
              <textarea matInput formControlName="description" rows="2" placeholder="Contract terms and scope details..."></textarea>
            </mat-form-field>

            <div class="col-span-full flex justify-end gap-2">
              <button mat-button type="button" (click)="showCreateForm = false">Cancel</button>
              <button mat-raised-button color="primary" type="submit" [disabled]="contractForm.invalid || isSubmitting">
                Create Contract
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>

      <!-- Filters & Search Toolbar -->
      <mat-card class="mb-6 p-4">
        <div class="filters-row">
          <mat-form-field appearance="outline" class="search-field">
            <mat-label>Search Contracts</mat-label>
            <input matInput [(ngModel)]="searchQuery" (input)="applyFilters()" placeholder="Search by title or contract number...">
            <mat-icon matPrefix>search</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline" class="filter-select">
            <mat-label>Status Filter</mat-label>
            <mat-select [(ngModel)]="statusFilter" (selectionChange)="applyFilters()">
              <mat-option value="">All Statuses</mat-option>
              <mat-option value="Draft">Draft</mat-option>
              <mat-option value="Under Review">Under Review</mat-option>
              <mat-option value="Approved">Approved</mat-option>
              <mat-option value="Active">Active</mat-option>
              <mat-option value="Expired">Expired</mat-option>
              <mat-option value="Terminated">Terminated</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="filter-select">
            <mat-label>Category Filter</mat-label>
            <mat-select [(ngModel)]="categoryFilter" (selectionChange)="applyFilters()">
              <mat-option value="">All Categories</mat-option>
              <mat-option value="Software">Software</mat-option>
              <mat-option value="Vendor Contract">Vendor Contract</mat-option>
              <mat-option value="Service Agreement">Service Agreement</mat-option>
              <mat-option value="Real Estate">Real Estate</mat-option>
            </mat-select>
          </mat-form-field>
        </div>
      </mat-card>

      <!-- Loading State -->
      <div *ngIf="isLoading" class="flex justify-center p-12">
        <mat-spinner diameter="40"></mat-spinner>
      </div>

      <!-- Contracts Data Table -->
      <mat-card *ngIf="!isLoading">
        <div class="table-container">
          <div *ngIf="filteredContracts.length === 0" class="p-8 text-center text-slate-500">
            <mat-icon class="text-4xl">folder_off</mat-icon>
            <p>No contracts found matching your filters.</p>
          </div>

          <table mat-table [dataSource]="filteredContracts" *ngIf="filteredContracts.length > 0" class="w-full">
            <ng-container matColumnDef="contract_number">
              <th mat-header-cell *matHeaderCellDef>Contract #</th>
              <td mat-cell *matCellDef="let element">
                <strong>{{ element.contract_number }}</strong>
              </td>
            </ng-container>

            <ng-container matColumnDef="title">
              <th mat-header-cell *matHeaderCellDef>Title</th>
              <td mat-cell *matCellDef="let element">{{ element.title }}</td>
            </ng-container>

            <ng-container matColumnDef="category">
              <th mat-header-cell *matHeaderCellDef>Category</th>
              <td mat-cell *matCellDef="let element">{{ element.category }}</td>
            </ng-container>

            <ng-container matColumnDef="dates">
              <th mat-header-cell *matHeaderCellDef>Start / End Date</th>
              <td mat-cell *matCellDef="let element">
                {{ element.start_date || '-' }} to {{ element.end_date || '-' }}
              </td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let element">
                <span class="badge" [ngClass]="getStatusBadgeClass(element.status)">
                  {{ element.status }}
                </span>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Workflow Actions</th>
              <td mat-cell *matCellDef="let element">
                <button mat-icon-button [matMenuTriggerFor]="actionMenu">
                  <mat-icon>more_vert</mat-icon>
                </button>

                <mat-menu #actionMenu="matMenu">
                  <button mat-menu-item (click)="transitionStatus(element, 'Under Review')" *ngIf="element.status === 'Draft'">
                    <mat-icon>find_in_page</mat-icon>
                    <span>Submit for Review</span>
                  </button>
                  <button mat-menu-item (click)="transitionStatus(element, 'Approved')" *ngIf="element.status === 'Under Review'">
                    <mat-icon>check_circle</mat-icon>
                    <span>Approve Contract</span>
                  </button>
                  <button mat-menu-item (click)="transitionStatus(element, 'Active')" *ngIf="element.status === 'Approved'">
                    <mat-icon>play_circle</mat-icon>
                    <span>Activate Contract</span>
                  </button>
                  <button mat-menu-item (click)="transitionStatus(element, 'Expired')" *ngIf="element.status === 'Active'">
                    <mat-icon>timer_off</mat-icon>
                    <span>Mark Expired</span>
                  </button>
                  <button mat-menu-item (click)="deleteContract(element)" class="text-rose-600">
                    <mat-icon color="warn">delete</mat-icon>
                    <span>Delete</span>
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
    .page-container {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .page-title { font-size: 1.5rem; font-weight: 800; margin: 0; }
    .page-subtitle { color: #64748b; font-size: 0.875rem; margin-top: 4px; }
    .grid-form {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 12px;
    }
    .col-span-full { grid-column: 1 / -1; }
    .filters-row {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }
    .search-field { flex: 1 1 280px; }
    .filter-select { width: 180px; }
    .w-full { width: 100%; }
    .mb-6 { margin-bottom: 24px; }
    .p-4 { padding: 16px; }
    .p-6 { padding: 24px; }
    .p-8 { padding: 32px; }
    .flex { display: flex; }
    .justify-end { justify-content: flex-end; }
    .gap-2 { gap: 8px; }
  `]
})
export class ContractsComponent implements OnInit {
  contracts: ContractModel[] = [];
  filteredContracts: ContractModel[] = [];
  isLoading = true;
  showCreateForm = false;
  isSubmitting = false;

  searchQuery = '';
  statusFilter = '';
  categoryFilter = '';

  displayedColumns: string[] = ['contract_number', 'title', 'category', 'dates', 'status', 'actions'];
  contractForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private contractService: ContractService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadContracts();
  }

  private initForm(): void {
    this.contractForm = this.fb.group({
      title: ['', Validators.required],
      contract_number: [`CNT-${Date.now().toString().slice(-5)}`, Validators.required],
      category: ['Software', Validators.required],
      start_date: ['2026-01-01'],
      end_date: ['2027-12-31'],
      description: ['']
    });
  }

  toggleCreateForm(): void {
    this.showCreateForm = !this.showCreateForm;
  }

  loadContracts(): void {
    this.isLoading = true;
    this.contractService.getContracts().subscribe({
      next: (data) => {
        this.contracts = data || [];
        this.applyFilters();
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.notificationService.showError('Failed to fetch contracts from backend.');
      }
    });
  }

  applyFilters(): void {
    this.filteredContracts = this.contracts.filter(c => {
      const matchesSearch = !this.searchQuery ||
        c.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        c.contract_number.toLowerCase().includes(this.searchQuery.toLowerCase());

      const matchesStatus = !this.statusFilter || c.status === this.statusFilter;
      const matchesCategory = !this.categoryFilter || c.category === this.categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }

  onCreateSubmit(): void {
    if (this.contractForm.invalid) return;
    this.isSubmitting = true;

    this.contractService.createContract(this.contractForm.value).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.showCreateForm = false;
        this.notificationService.showSuccess(`Contract '${res.contract_number}' created successfully!`);
        this.initForm();
        this.loadContracts();
      },
      error: (err) => {
        this.isSubmitting = false;
        this.notificationService.showError(err.error?.detail || 'Failed to create contract.');
      }
    });
  }

  transitionStatus(contract: ContractModel, targetStatus: string): void {
    const id = contract.id || contract.contract_id;
    if (!id) return;

    this.contractService.updateStatus(id, targetStatus).subscribe({
      next: () => {
        this.notificationService.showSuccess(`Contract '${contract.contract_number}' status updated to ${targetStatus}!`);
        this.loadContracts();
      },
      error: (err) => {
        this.notificationService.showError(err.error?.detail || 'Status transition failed.');
      }
    });
  }

  deleteContract(contract: ContractModel): void {
    const id = contract.id || contract.contract_id;
    if (!id) return;

    if (confirm(`Are you sure you want to delete contract ${contract.contract_number}?`)) {
      this.contractService.deleteContract(id).subscribe({
        next: () => {
          this.notificationService.showSuccess(`Contract ${contract.contract_number} deleted.`);
          this.loadContracts();
        },
        error: () => this.notificationService.showError('Failed to delete contract.')
      });
    }
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'Active': return 'badge-active';
      case 'Draft': return 'badge-draft';
      case 'Under Review': return 'badge-review';
      case 'Approved': return 'badge-approved';
      case 'Expired': return 'badge-expired';
      case 'Terminated': return 'badge-overdue';
      default: return 'badge-draft';
    }
  }
}
