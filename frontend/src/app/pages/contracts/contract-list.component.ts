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
import { ContractsService } from '../../core/data.service';
import { ContractListItem, CONTRACT_CATEGORIES, CONTRACT_STATUSES } from '../../core/models';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { StatusChipComponent } from '../../shared/ui/status-chip.component';
import { apiErrorMessage } from '../../core/error.util';

@Component({
 selector:'app-contract-list',standalone:true,
 imports:[CommonModule,FormsModule,RouterLink,MatButtonModule,MatCardModule,MatFormFieldModule,MatInputModule,MatSelectModule,MatProgressSpinnerModule,PageHeaderComponent,StatusChipComponent],
 template:`
 <app-page-header title="Contracts" [subtitle]="filtered().length+' of '+contracts().length+' contracts'"><a mat-flat-button color="primary" routerLink="/contracts/new">New contract</a></app-page-header>
 <div class="filters">
   <mat-form-field appearance="outline"><mat-label>Search</mat-label><input matInput [(ngModel)]="query" placeholder="Title or contract number"></mat-form-field>
   <mat-form-field appearance="outline"><mat-label>Status</mat-label><mat-select [(ngModel)]="statusFilter"><mat-option value="">All statuses</mat-option><mat-option *ngFor="let s of statuses" [value]="s">{{s}}</mat-option></mat-select></mat-form-field>
   <mat-form-field appearance="outline"><mat-label>Category</mat-label><mat-select [(ngModel)]="categoryFilter"><mat-option value="">All categories</mat-option><mat-option *ngFor="let c of categories" [value]="c">{{c}}</mat-option></mat-select></mat-form-field>
   <button mat-stroked-button type="button" (click)="clear()">Clear</button>
 </div>
 <div class="error" *ngIf="error()">{{error()}}</div>
 <mat-card class="table-card">
   <div class="loading" *ngIf="loading()"><mat-spinner diameter="32"></mat-spinner></div>
   <div class="table-wrap" *ngIf="!loading() && filtered().length; else empty">
   <table><thead><tr><th>Docket</th><th>Title</th><th>Category</th><th>Status</th><th>End date</th><th></th></tr></thead>
   <tbody><tr *ngFor="let c of filtered()"><td class="docket">{{c.contract_number}}</td><td><a [routerLink]="['/contracts',c.id]" class="title">{{c.title}}</a></td><td>{{c.category}}</td><td><app-status-chip [status]="c.status"></app-status-chip></td><td>{{c.end_date|date:'mediumDate'}}</td><td><a mat-stroked-button [routerLink]="['/contracts',c.id]">Open</a></td></tr></tbody></table>
   </div>
   <ng-template #empty><div class="empty"><mat-icon>search_off</mat-icon><strong>{{contracts().length?'No contracts match your filters.':'No contracts found.'}}</strong><span>Create your first contract to begin the register.</span></div></ng-template>
 </mat-card>
 `,
 styles:[`
 .filters{display:flex;gap:12px;align-items:center;margin-bottom:8px;flex-wrap:wrap}.filters mat-form-field{min-width:190px}.filters mat-form-field:first-child{flex:1;min-width:240px}
 .table-card{padding:0;overflow:hidden}.table-wrap{overflow:auto}table{width:100%;border-collapse:collapse}th{text-align:left;font-size:12px;color:var(--ink-soft);font-weight:600;padding:12px 16px;border-bottom:1px solid var(--line);white-space:nowrap}td{padding:13px 16px;border-bottom:1px solid var(--line);font-size:13.5px;white-space:nowrap}tr:last-child td{border:0}tr:hover{background:#fafaf7}.docket{font:500 11.5px var(--font-mono);color:var(--ink-soft)}.title{text-decoration:none;font-weight:600}.loading{min-height:300px;display:grid;place-items:center}.empty{min-height:300px;display:flex;flex-direction:column;align-items:center;justify-content:center;color:var(--ink-soft);gap:4px}.empty mat-icon{font-size:36px;width:36px;height:36px;margin-bottom:6px}.empty strong{font-family:var(--font-display);font-size:17px;color:var(--ink)}
 .error{background:var(--rose-soft);color:var(--rose);padding:10px 12px;border-radius:4px;margin-bottom:12px;font-size:13px}
 `]
})
export class ContractListComponent implements OnInit {
 private svc=inject(ContractsService);contracts=signal<ContractListItem[]>([]);loading=signal(false);error=signal('');
 query='';statusFilter='';categoryFilter='';statuses=CONTRACT_STATUSES;categories=CONTRACT_CATEGORIES;
 ngOnInit(){this.load()}
 load(){this.loading.set(true);this.svc.list().subscribe({next:x=>{this.contracts.set(x);this.loading.set(false)},error:e=>{this.loading.set(false);this.error.set(apiErrorMessage(e,'Unable to load contracts.'))}})}
 filtered(){const q=this.query.trim().toLowerCase();return this.contracts().filter(c=>(!this.statusFilter||c.status===this.statusFilter)&&(!this.categoryFilter||c.category===this.categoryFilter)&&(!q||`${c.title} ${c.contract_number}`.toLowerCase().includes(q)))}
 clear(){this.query='';this.statusFilter='';this.categoryFilter=''}
}
