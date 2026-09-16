import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin, finalize } from 'rxjs';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';
import * as permissions from '../services/permissions';

interface Row { [key: string]: any }

@Component({
  selector: 'app-workspace',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './workspace.component.html',
  styleUrl: './workspace.component.scss',
})
export class WorkspaceComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(ApiService);
  private readonly fb = inject(FormBuilder);
  private readonly changeDetector = inject(ChangeDetectorRef);
  private readonly auth = inject(AuthService);
  section = this.route.snapshot.data['section'] as string;
  rows: Row[] = [];
  summary: any = null;
  loading = true;
  saving = false;
  error = '';
  notice = '';
  search = '';
  showForm = false;
  editingId: number | null = null;
  form = this.fb.nonNullable.group({
    title: ['', Validators.required], contract_number: ['', Validators.required], category: ['Service Agreement', Validators.required],
    start_date: [''], end_date: [''], contract_id: ['', Validators.required], obligation_type: ['Reporting Requirement', Validators.required],
    due_date: ['', Validators.required], assigned_to: ['', Validators.required], renewal_date: ['', Validators.required],
    previous_expiry_date: ['', Validators.required], new_expiry_date: [''], notification_type: ['Contract Status Alert', Validators.required],
    message: ['', Validators.required],
  });

  constructor() { this.load(); }

  get title(): string { return this.section === 'audit' ? 'Audit history' : this.section[0].toUpperCase() + this.section.slice(1); }
  get filteredRows(): Row[] {
    const query = this.search.trim().toLowerCase();
    return query ? this.rows.filter(row => Object.values(row).some(value => String(value ?? '').toLowerCase().includes(query))) : this.rows;
  }
  get isCrud(): boolean { return ['contracts', 'obligations', 'renewals', 'notifications'].includes(this.section); }
  get role(): string { return this.auth.currentUser()?.role ?? ''; }
  get canCreate(): boolean {
    return permissions.canCreate(this.section, this.role);
  }
  get canUpdate(): boolean {
    return permissions.canUpdate(this.section, this.role);
  }
  get canDelete(): boolean { return permissions.canDelete(this.section, this.role); }
  get canWorkflow(): boolean { return permissions.canChangeStatus(this.section, this.role); }
  get columns(): string[] {
    if (this.section === 'contracts') return ['contract_number', 'title', 'category', 'status', 'start_date', 'end_date'];
    if (this.section === 'obligations') return ['title', 'obligation_type', 'due_date', 'status', 'assigned_to'];
    if (this.section === 'renewals') return ['contract_id', 'renewal_date', 'previous_expiry_date', 'status', 'new_expiry_date'];
    if (this.section === 'notifications') return ['notification_type', 'title', 'message', 'status', 'created_at'];
    if (this.section === 'audit') return ['action', 'user_name', 'entity_type', 'entity_id', 'contract_id', 'created_at', 'old_value', 'new_value'];
    if (this.section === 'compliance') return ['contract_id', 'total_obligations', 'completed_obligations', 'pending_obligations', 'delayed_obligations', 'overdue_obligations', 'compliance_score', 'compliance_status', 'risk_level'];
    return [];
  }

  load(): void {
    this.loading = true; this.error = ''; this.summary = null;
    let request = this.api.list<Row[]>(this.pathForSection());
    if (this.section === 'audit') request = this.api.getAuditHistory() as any;
    if (this.section === 'reports') {
      request = forkJoin({ contracts: this.api.list<Row>('/reports/contracts/summary'), obligations: this.api.list<Row>('/reports/obligations/summary'), renewals: this.api.list<Row>('/reports/renewals/summary'), compliance: this.api.list<Row>('/reports/compliance/summary') }) as any;
    }
    if (this.section === 'compliance') request = forkJoin({ records: this.api.list<Row[]>('/compliance/'), summary: this.api.list<Row>('/compliance/summary') }) as any;
    request.pipe(finalize(() => { this.loading = false; this.changeDetector.markForCheck(); })).subscribe({ next: (data: any) => { this.summary = this.section === 'reports' || this.section === 'compliance' ? data.summary ?? data : null; this.rows = this.section === 'compliance' ? data.records : Array.isArray(data) ? data : []; this.changeDetector.markForCheck(); }, error: (error) => { this.error = this.messageForError(error); this.changeDetector.markForCheck(); } });
  }

  private pathForSection(): string {
    if (this.section === 'audit') return '/audit';
    return `/${this.section}`;
  }

  formatValue(row: Row, column: string): string {
    const value = row[column];
    if (value === null || value === undefined || value === '') return '—';
    return typeof value === 'object' ? JSON.stringify(value) : String(value);
  }

  submit(): void {
    if (this.section === 'compliance') {
      this.error = 'Compliance records are calculated by the backend and cannot be created from this page.';
      return;
    }
    const requiredControls = this.requiredControlsForSection();
    const invalidControls = requiredControls.filter((controlName) => this.form.controls[controlName].invalid);
    if (invalidControls.length) {
      invalidControls.forEach((controlName) => this.form.controls[controlName].markAsTouched());
      this.error = this.section === 'contracts'
        ? 'Please enter a title, contract number, and category.'
        : 'Please complete all required fields.';
      return;
    }
    this.saving = true; this.error = ''; const wasEditing = this.editingId !== null; const value = this.form.getRawValue();
    let request;
    if (this.section === 'contracts') {
      const body = { title: value.title, contract_number: value.contract_number, category: value.category, start_date: value.start_date || null, end_date: value.end_date || null };
      request = this.editingId ? this.api.update(`/contracts/${this.editingId}`, body) : this.api.create('/contracts', body);
    } else if (this.section === 'obligations') {
      const body = { contract_id: Number(value.contract_id), title: value.title, obligation_type: value.obligation_type, due_date: value.due_date, assigned_to: Number(value.assigned_to) };
      request = this.editingId ? this.api.update(`/obligations/${this.editingId}`, body) : this.api.create('/obligations', body);
    } else if (this.section === 'renewals') {
      const body = { contract_id: Number(value.contract_id), renewal_date: value.renewal_date, previous_expiry_date: value.previous_expiry_date, new_expiry_date: value.new_expiry_date || null, assigned_to: value.assigned_to ? Number(value.assigned_to) : null };
      request = this.editingId ? this.api.update(`/renewals/${this.editingId}`, body) : this.api.create('/renewals', body);
    }
    else request = this.api.create('/notifications', { user_id: Number(value.assigned_to), notification_type: value.notification_type, title: value.title, message: value.message });
    request.pipe(finalize(() => this.saving = false)).subscribe({ next: () => { this.showForm = false; this.editingId = null; this.notice = `${this.title.slice(0, -1)} ${wasEditing ? 'updated' : 'created'} successfully.`; this.form.reset({ category: 'Service Agreement', obligation_type: 'Reporting Requirement', notification_type: 'Contract Status Alert' }); this.load(); }, error: (error) => this.error = this.messageForError(error, this.section === 'contracts' && !wasEditing) });
  }

  private requiredControlsForSection(): Array<keyof typeof this.form.controls> {
    if (this.section === 'contracts') return ['title', 'contract_number', 'category'];
    if (this.section === 'obligations') return ['contract_id', 'title', 'obligation_type', 'due_date', 'assigned_to'];
    if (this.section === 'renewals') return ['contract_id', 'renewal_date', 'previous_expiry_date', 'assigned_to'];
    return ['assigned_to', 'notification_type', 'title', 'message'];
  }

  edit(row: Row): void {
    this.editingId = row['id'];
    this.showForm = true;
    this.form.patchValue({
      title: row['title'] ?? '', contract_number: row['contract_number'] ?? '', category: row['category'] ?? 'Service Agreement',
      start_date: row['start_date'] ?? '', end_date: row['end_date'] ?? '', contract_id: String(row['contract_id'] ?? ''),
      obligation_type: row['obligation_type'] ?? 'Reporting Requirement', due_date: row['due_date'] ?? '', assigned_to: String(row['assigned_to'] ?? ''),
      renewal_date: row['renewal_date'] ?? '', previous_expiry_date: row['previous_expiry_date'] ?? '', new_expiry_date: row['new_expiry_date'] ?? '',
    });
  }

  changeStatus(row: Row, status: string): void {
    const path = this.section === 'contracts' ? `/contracts/${row['id']}/status` : this.section === 'obligations' ? `/obligations/${row['id']}/status` : `/renewals/${row['id']}/status`;
    this.api.patch(path, { status }).subscribe({ next: () => { this.notice = 'Status updated.'; this.load(); }, error: (error) => this.error = this.messageForError(error) });
  }

  private messageForError(error: { status?: number }, creatingContract = false): string {
    const status = error.status ?? 0;
    if (status === 401) return 'Your session has expired. Please login again.';
    if (status === 403) return this.section === 'audit' ? 'You do not have permission to view audit history.' : this.section === 'compliance' ? 'You do not have permission to view compliance data.' : creatingContract ? 'You do not have permission to create a contract.' : 'You do not have permission to perform this action.';
    if (status === 404) return this.section === 'audit' ? 'Audit history endpoint was not found.' : this.section === 'compliance' ? 'Compliance data endpoint was not found.' : 'Requested resource was not found.';
    if (status === 422) return 'Invalid request data.';
    if (status === 400) return 'Invalid request.';
    if (status >= 500) return this.section === 'audit' ? 'Unable to load audit history.' : this.section === 'compliance' ? 'Unable to load compliance data.' : 'Server error. Please try again.';
    if (status === 0) return 'The backend is unavailable. Check your connection and try again.';
    return 'Request could not be completed. Please try again.';
  }

  markRead(row: Row): void { this.api.patch(`/notifications/${row['id']}/read`).subscribe({ next: () => this.load(), error: (error) => this.error = this.messageForError(error) }); }
  deleteContract(row: Row): void { if (!confirm(`Delete ${row['contract_number']}?`)) return; this.api.remove(`/contracts/${row['id']}`).subscribe({ next: () => this.load(), error: (error) => this.error = this.messageForError(error) }); }
  exportReport(type: string, extension: string): void {
    this.api.download(`/reports/${type}/export/${extension}`).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${type}-report.${extension === 'excel' ? 'xlsx' : 'pdf'}`;
        link.click();
        URL.revokeObjectURL(url);
      },
      error: (error) => this.error = this.messageForError(error),
    });
  }
}
