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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ObligationService, ObligationModel } from '../../core/services/obligation.service';
import { ContractService, ContractModel } from '../../core/services/contract.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-obligations-page',
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
    MatProgressSpinnerModule
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">Obligation Tracking</h1>
          <p class="page-subtitle">Track, assign, and update contractual performance obligations.</p>
        </div>
        <button mat-flat-button color="primary" (click)="toggleCreateForm()">
          <mat-icon>{{ showCreateForm ? 'close' : 'add' }}</mat-icon>
          <span>{{ showCreateForm ? 'Cancel' : 'New Obligation' }}</span>
        </button>
      </div>

      <!-- Create Obligation Form Panel -->
      <mat-card *ngIf="showCreateForm" class="mb-6 p-4">
        <mat-card-header>
          <mat-card-title>Create Contract Obligation</mat-card-title>
        </mat-card-header>
        <mat-card-content class="pt-4">
          <form [formGroup]="obligationForm" (ngSubmit)="onCreateSubmit()" class="grid-form">
            <mat-form-field appearance="outline">
              <mat-label>Associated Contract</mat-label>
              <mat-select formControlName="contract_id">
                <mat-option *ngFor="let c of contracts" [value]="c.id || c.contract_id">
                  {{ c.contract_number }} — {{ c.title }}
                </mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Obligation Title</mat-label>
              <input matInput formControlName="title" placeholder="e.g. Monthly Maintenance Inspection">
              <mat-error *ngIf="obligationForm.get('title')?.hasError('required')">Title is required</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Obligation Type</mat-label>
              <mat-select formControlName="obligation_type">
                <mat-option value="Maintenance">Maintenance</mat-option>
                <mat-option value="Deployment">Deployment</mat-option>
                <mat-option value="Audit">Audit</mat-option>
                <mat-option value="Reporting Requirement">Reporting Requirement</mat-option>
                <mat-option value="Payment">Payment</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Due Date</mat-label>
              <input matInput type="date" formControlName="due_date">
            </mat-form-field>

            <mat-form-field appearance="outline" class="col-span-full">
              <mat-label>Description</mat-label>
              <textarea matInput formControlName="description" rows="2" placeholder="Specific deliverable details..."></textarea>
            </mat-form-field>

            <div class="col-span-full flex justify-end gap-2">
              <button mat-button type="button" (click)="showCreateForm = false">Cancel</button>
              <button mat-raised-button color="primary" type="submit" [disabled]="obligationForm.invalid || isSubmitting">
                Create Obligation
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>

      <!-- Filters Row -->
      <mat-card class="mb-6 p-4">
        <div class="filters-row">
          <mat-form-field appearance="outline" class="search-field">
            <mat-label>Search Obligations</mat-label>
            <input matInput [(ngModel)]="searchQuery" (input)="applyFilters()" placeholder="Search title or type...">
            <mat-icon matPrefix>search</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline" class="filter-select">
            <mat-label>Status Filter</mat-label>
            <mat-select [(ngModel)]="statusFilter" (selectionChange)="applyFilters()">
              <mat-option value="">All Statuses</mat-option>
              <mat-option value="Pending">Pending</mat-option>
              <mat-option value="In Progress">In Progress</mat-option>
              <mat-option value="Completed">Completed</mat-option>
              <mat-option value="Overdue">Overdue</mat-option>
            </mat-select>
          </mat-form-field>
        </div>
      </mat-card>

      <!-- Loading State -->
      <div *ngIf="isLoading" class="flex justify-center p-12">
        <mat-spinner diameter="40"></mat-spinner>
      </div>

      <!-- Obligations Table -->
      <mat-card *ngIf="!isLoading">
        <div class="table-container">
          <div *ngIf="filteredObligations.length === 0" class="p-8 text-center text-slate-500">
            <mat-icon class="text-4xl">assignment_late</mat-icon>
            <p>No obligations found.</p>
          </div>

          <table mat-table [dataSource]="filteredObligations" *ngIf="filteredObligations.length > 0" class="w-full">
            <ng-container matColumnDef="title">
              <th mat-header-cell *matHeaderCellDef>Obligation Title</th>
              <td mat-cell *matCellDef="let element">
                <strong>{{ element.title }}</strong>
              </td>
            </ng-container>

            <ng-container matColumnDef="contract_id">
              <th mat-header-cell *matHeaderCellDef>Contract #</th>
              <td mat-cell *matCellDef="let element">
                CNT-{{ element.contract_id }}
              </td>
            </ng-container>

            <ng-container matColumnDef="obligation_type">
              <th mat-header-cell *matHeaderCellDef>Type</th>
              <td mat-cell *matCellDef="let element">{{ element.obligation_type }}</td>
            </ng-container>

            <ng-container matColumnDef="due_date">
              <th mat-header-cell *matHeaderCellDef>Due Date</th>
              <td mat-cell *matCellDef="let element">{{ element.due_date || '-' }}</td>
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
              <th mat-header-cell *matHeaderCellDef>Status Update</th>
              <td mat-cell *matCellDef="let element">
                <button mat-icon-button [matMenuTriggerFor]="statusMenu">
                  <mat-icon>edit</mat-icon>
                </button>
                <mat-menu #statusMenu="matMenu">
                  <button mat-menu-item (click)="updateStatus(element, 'In Progress')">
                    <mat-icon>play_arrow</mat-icon>
                    <span>In Progress</span>
                  </button>
                  <button mat-menu-item (click)="updateStatus(element, 'Completed')">
                    <mat-icon color="primary">check_circle</mat-icon>
                    <span>Completed</span>
                  </button>
                  <button mat-menu-item (click)="updateStatus(element, 'Overdue')">
                    <mat-icon color="warn">warning</mat-icon>
                    <span>Overdue</span>
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
    .filters-row { display: flex; gap: 16px; flex-wrap: wrap; }
    .search-field { flex: 1 1 280px; }
    .filter-select { width: 180px; }
    .w-full { width: 100%; }
    .mb-6 { margin-bottom: 24px; }
    .p-4 { padding: 16px; }
    .p-8 { padding: 32px; }
  `]
})
export class ObligationsComponent implements OnInit {
  obligations: ObligationModel[] = [];
  filteredObligations: ObligationModel[] = [];
  contracts: ContractModel[] = [];

  isLoading = true;
  showCreateForm = false;
  isSubmitting = false;

  searchQuery = '';
  statusFilter = '';

  displayedColumns: string[] = ['title', 'contract_id', 'obligation_type', 'due_date', 'status', 'actions'];
  obligationForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private obligationService: ObligationService,
    private contractService: ContractService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadData();
  }

  private initForm(): void {
    this.obligationForm = this.fb.group({
      contract_id: [1, Validators.required],
      title: ['', Validators.required],
      obligation_type: ['Maintenance', Validators.required],
      due_date: ['2026-10-30'],
      description: ['']
    });
  }

  toggleCreateForm(): void {
    this.showCreateForm = !this.showCreateForm;
  }

  loadData(): void {
    this.isLoading = true;
    this.contractService.getContracts().subscribe(contracts => {
      this.contracts = contracts || [];
      if (this.contracts.length > 0) {
        const firstId = this.contracts[0].id || this.contracts[0].contract_id;
        this.obligationForm.patchValue({ contract_id: firstId });
      }

      this.obligationService.getObligations().subscribe({
        next: (data) => {
          this.obligations = data || [];
          this.applyFilters();
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
          this.notificationService.showError('Failed to fetch obligations.');
        }
      });
    });
  }

  applyFilters(): void {
    this.filteredObligations = this.obligations.filter(o => {
      const matchesSearch = !this.searchQuery ||
        o.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        o.obligation_type.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchesStatus = !this.statusFilter || o.status === this.statusFilter;
      return matchesSearch && matchesStatus;
    });
  }

  onCreateSubmit(): void {
    if (this.obligationForm.invalid) return;
    this.isSubmitting = true;

    const payload = {
      ...this.obligationForm.value,
      assigned_to: 1
    };

    this.obligationService.createObligation(payload).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.showCreateForm = false;
        this.notificationService.showSuccess(`Obligation '${res.title}' created!`);
        this.loadData();
      },
      error: (err) => {
        this.isSubmitting = false;
        this.notificationService.showError(err.error?.detail || 'Failed to create obligation.');
      }
    });
  }

  updateStatus(item: ObligationModel, targetStatus: string): void {
    const id = item.obligation_id || item.id;
    if (!id) return;

    this.obligationService.updateStatus(id, targetStatus).subscribe({
      next: () => {
        this.notificationService.showSuccess(`Obligation status set to ${targetStatus}`);
        this.loadData();
      },
      error: () => this.notificationService.showError('Failed to update status.')
    });
  }

  getBadgeClass(status: string): string {
    switch (status) {
      case 'Completed': return 'badge-active';
      case 'In Progress': return 'badge-review';
      case 'Overdue': return 'badge-overdue';
      default: return 'badge-draft';
    }
  }
}
