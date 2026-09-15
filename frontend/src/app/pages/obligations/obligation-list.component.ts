import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { ObligationsService } from '../../core/data.service';
import { ObligationListItem, OBLIGATION_STATUSES } from '../../core/models';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { StatusChipComponent } from '../../shared/ui/status-chip.component';
import { apiErrorMessage } from '../../core/error.util';

@Component({
 selector:'app-obligation-list',standalone:true,
 imports:[CommonModule,FormsModule,RouterLink,MatButtonModule,MatCardModule,MatFormFieldModule,MatInputModule,MatSelectModule,MatProgressSpinnerModule,MatIconModule,PageHeaderComponent,StatusChipComponent],
 template:`
 <app-page-header title="Obligations" [subtitle]="filtered().length+' of '+items().length+' obligations tracked'"><a mat-flat-button color="primary" routerLink="/obligations/new">Register obligation</a></app-page-header>
 <div class="filters"><mat-form-field appearance="outline"><mat-label>Search</mat-label><input matInput [(ngModel)]="query" placeholder="Obligation title"></mat-form-field><mat-form-field appearance="outline"><mat-label>Status</mat-label><mat-select [(ngModel)]="statusFilter"><mat-option value="">All statuses</mat-option><mat-option *ngFor="let s of statuses" [value]="s">{{s}}</mat-option></mat-select></mat-form-field><button mat-stroked-button (click)="clear()">Clear</button></div>
 <div class="error" *ngIf="error()">{{error()}}</div><mat-card class="table-card"><div class="loading" *ngIf="loading()"><mat-spinner diameter="32"></mat-spinner></div>
 <div class="table-wrap" *ngIf="!loading()&&filtered().length;else empty"><table><thead><tr><th>Obligation</th><th>Contract</th><th>Type</th><th>Due date</th><th>Status</th><th>Actions</th></tr></thead><tbody><tr *ngFor="let o of filtered()"><td><a [routerLink]="['/obligations',o.id]" class="title">{{o.title}}</a></td><td><a [routerLink]="['/contracts',o.contract_id]" class="docket">#{{o.contract_id}}</a></td><td>{{o.obligation_type}}</td><td [class.overdue]="isOverdue(o)">{{o.due_date|date:'mediumDate'}}</td><td><app-status-chip [status]="effectiveStatus(o)"></app-status-chip></td><td><a mat-stroked-button [routerLink]="['/obligations',o.id]">Open</a><button mat-button color="primary" *ngIf="o.status!=='Completed'" (click)="complete(o)">Complete</button></td></tr></tbody></table></div>
 <ng-template #empty><div class="empty"><mat-icon>task_alt</mat-icon><strong>{{items().length?'No obligations match your filters.':'No obligations found.'}}</strong><span>Register obligations against your contracts to track delivery and compliance.</span></div></ng-template></mat-card>
 `,
 styles:[`.filters{display:flex;gap:12px;align-items:center;flex-wrap:wrap}.filters mat-form-field:first-child{flex:1;min-width:250px}.table-card{padding:0;overflow:hidden}.table-wrap{overflow:auto}table{width:100%;border-collapse:collapse}th{text-align:left;font-size:12px;color:var(--ink-soft);padding:12px 16px;border-bottom:1px solid var(--line)}td{padding:12px 16px;border-bottom:1px solid var(--line);font-size:13px;white-space:nowrap}.title{text-decoration:none;font-weight:600}.docket{font:500 11.5px var(--font-mono);color:var(--ink-soft)}.overdue{color:var(--rose);font-weight:600}.loading{min-height:300px;display:grid;place-items:center}.empty{min-height:300px;display:flex;flex-direction:column;align-items:center;justify-content:center;color:var(--ink-soft);gap:4px}.empty mat-icon{font-size:36px;width:36px;height:36px;margin-bottom:5px}.empty strong{font:600 17px var(--font-display);color:var(--ink)}.error{background:var(--rose-soft);color:var(--rose);padding:10px 12px;border-radius:4px;margin:12px 0;font-size:13px}`]
})
export class ObligationListComponent implements OnInit {
 private svc=inject(ObligationsService);items=signal<ObligationListItem[]>([]);loading=signal(false);error=signal('');query='';statusFilter='';statuses=OBLIGATION_STATUSES;
 ngOnInit(){this.load()}load(){this.loading.set(true);this.svc.list().subscribe({next:x=>{this.items.set(x);this.loading.set(false)},error:e=>{this.loading.set(false);this.error.set(apiErrorMessage(e,'Unable to load obligations.'))}})}
 filtered(){const q=this.query.trim().toLowerCase();return this.items().filter(o=>(!this.statusFilter||this.effectiveStatus(o)===this.statusFilter)&&(!q||o.title.toLowerCase().includes(q)))}clear(){this.query='';this.statusFilter=''}
 isOverdue(o:ObligationListItem){return o.status!=='Completed'&&new Date(o.due_date)<new Date(new Date().toDateString())}
 effectiveStatus(o:ObligationListItem){return this.isOverdue(o)?'Overdue':o.status}
 complete(o:ObligationListItem){this.svc.complete(o.id).subscribe({next:u=>this.items.set(this.items().map(x=>x.id===u.id?{...x,status:u.status}:x)),error:e=>this.error.set(apiErrorMessage(e,'Unable to complete the obligation.'))})}
}
