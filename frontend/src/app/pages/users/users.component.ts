import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { UsersService } from '../../core/data.service';
import { User, USER_ROLES, UserRole } from '../../core/models';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { StatusChipComponent } from '../../shared/ui/status-chip.component';
import { apiErrorMessage } from '../../core/error.util';

@Component({
 selector:'app-users',standalone:true,
 imports:[CommonModule,FormsModule,MatButtonModule,MatCardModule,MatFormFieldModule,MatSelectModule,PageHeaderComponent,StatusChipComponent],
 template:`
 <app-page-header title="Users" subtitle="Administrator-only role and access management."><button mat-stroked-button (click)="load()">Refresh</button></app-page-header>
 <div class="error" *ngIf="error()">{{error()}}</div>
 <mat-card class="table-card"><div class="table-wrap" *ngIf="users().length;else empty"><table><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th></th></tr></thead><tbody><tr *ngFor="let u of users()"><td>{{u.full_name}}</td><td>{{u.email}}</td><td><mat-form-field appearance="outline"><mat-select [value]="u.role" (selectionChange)="changeRole(u,$event.value)"><mat-option *ngFor="let r of roles" [value]="r">{{r}}</mat-option></mat-select></mat-form-field></td><td><app-status-chip [status]="u.is_active?'Active':'Inactive'"></app-status-chip></td><td><button mat-stroked-button color="warn" *ngIf="u.is_active" (click)="deactivate(u)">Deactivate</button></td></tr></tbody></table></div><ng-template #empty><div class="empty">No users found.</div></ng-template></mat-card>
 `,
 styles:[`.table-card{padding:0;overflow:hidden}.table-wrap{overflow:auto}table{width:100%;border-collapse:collapse}th{text-align:left;font-size:12px;color:var(--ink-soft);padding:12px 16px;border-bottom:1px solid var(--line)}td{padding:10px 16px;border-bottom:1px solid var(--line);font-size:13px;white-space:nowrap}td mat-form-field{width:190px;margin:0}.empty{padding:48px;text-align:center;color:var(--ink-soft)}.error{background:var(--rose-soft);color:var(--rose);padding:10px 12px;border-radius:4px;margin-bottom:12px}`]
})
export class UsersComponent implements OnInit {
 private svc=inject(UsersService);users=signal<User[]>([]);error=signal('');roles=USER_ROLES;
 ngOnInit(){this.load()}load(){this.svc.list().subscribe({next:x=>this.users.set(x),error:e=>this.error.set(apiErrorMessage(e,'Unable to load users.'))})}
 changeRole(u:User,role:UserRole){this.svc.updateRole(u.id,role).subscribe({next:x=>this.users.set(this.users().map(y=>y.id===x.id?x:y)),error:e=>this.error.set(apiErrorMessage(e,'Unable to update role.'))})}
 deactivate(u:User){if(!confirm(`Deactivate ${u.full_name}?`))return;this.svc.deactivate(u.id).subscribe({next:()=>this.users.set(this.users().map(y=>y.id===u.id?{...y,is_active:false}:y)),error:e=>this.error.set(apiErrorMessage(e,'Unable to deactivate user.'))})}
}
