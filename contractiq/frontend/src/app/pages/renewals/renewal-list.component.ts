import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { RenewalsService } from '../../core/data.service';
import { Renewal, RENEWAL_STATUSES } from '../../core/models';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { StatusChipComponent } from '../../shared/ui/status-chip.component';
import { apiErrorMessage } from '../../core/error.util';

@Component({
 selector:'app-renewal-list',standalone:true,
 imports:[CommonModule,FormsModule,RouterLink,MatButtonModule,MatCardModule,MatFormFieldModule,MatInputModule,MatSelectModule,MatIconModule,PageHeaderComponent,StatusChipComponent],
 template:`
 <app-page-header title="Renewals" [subtitle]="filtered().length+' renewal records'"><a mat-flat-button color="primary" routerLink="/renewals/new">New renewal</a></app-page-header>
 <div class="filters"><mat-form-field appearance="outline"><mat-label>Search</mat-label><input matInput [(ngModel)]="query" placeholder="Contract ID"></mat-form-field><mat-form-field appearance="outline"><mat-label>Status</mat-label><mat-select [(ngModel)]="statusFilter"><mat-option value="">All statuses</mat-option><mat-option *ngFor="let s of statuses" [value]="s">{{s}}</mat-option></mat-select></mat-form-field><mat-form-field appearance="outline"><mat-label>Renewal from</mat-label><input matInput type="date" [(ngModel)]="fromDate"></mat-form-field><mat-form-field appearance="outline"><mat-label>Renewal to</mat-label><input matInput type="date" [(ngModel)]="toDate"></mat-form-field></div>
 <div class="error" *ngIf="error()">{{error()}}</div>
 <mat-card class="table-card"><div class="table-wrap" *ngIf="filtered().length;else empty"><table><thead><tr><th>Contract</th><th>Renewal date</th><th>Previous expiry</th><th>New expiry</th><th>Status</th><th>Action</th></tr></thead><tbody><tr *ngFor="let r of filtered()"><td><a class="docket" [routerLink]="['/contracts',r.contract_id]">#{{r.contract_id}}</a></td><td>{{r.renewal_date|date:'mediumDate'}}</td><td>{{r.previous_expiry_date|date:'mediumDate'}}</td><td>{{r.new_expiry_date|date:'mediumDate'}}</td><td><app-status-chip [status]="r.status"></app-status-chip></td><td><button mat-stroked-button *ngIf="r.status==='Upcoming'" (click)="setStatus(r,'In Progress')">Start</button><button mat-stroked-button *ngIf="r.status==='In Progress'" (click)="complete(r)">Mark renewed</button></td></tr></tbody></table></div><ng-template #empty><div class="empty"><mat-icon>event_busy</mat-icon><strong>{{renewals().length?'No renewals match your filters.':'No renewal records found.'}}</strong><span>Renewals are linked to contract expiry dates.</span></div></ng-template></mat-card>
 `,
 styles:[`.filters{display:flex;gap:12px;flex-wrap:wrap}.filters mat-form-field{min-width:170px}.table-card{padding:0;overflow:hidden}.table-wrap{overflow:auto}table{width:100%;border-collapse:collapse}th{text-align:left;font-size:12px;color:var(--ink-soft);padding:12px 16px;border-bottom:1px solid var(--line)}td{padding:12px 16px;border-bottom:1px solid var(--line);font-size:13px;white-space:nowrap}.docket{font:500 11.5px var(--font-mono);color:var(--ink-soft)}.empty{min-height:260px;display:flex;align-items:center;justify-content:center;flex-direction:column;color:var(--ink-soft);gap:4px}.empty mat-icon{font-size:34px;width:34px;height:34px}.empty strong{font:600 17px var(--font-display);color:var(--ink)}.error{background:var(--rose-soft);color:var(--rose);padding:10px 12px;border-radius:4px;margin-bottom:12px;font-size:13px}`]
})
export class RenewalListComponent implements OnInit {
 private svc=inject(RenewalsService);renewals=signal<Renewal[]>([]);error=signal('');query='';statusFilter='';fromDate='';toDate='';statuses=RENEWAL_STATUSES;
 ngOnInit(){this.load()}load(){this.svc.list().subscribe({next:x=>this.renewals.set(x),error:e=>this.error.set(apiErrorMessage(e,'Unable to load renewals.'))})}
 filtered(){return this.renewals().filter(r=>(!this.statusFilter||r.status===this.statusFilter)&&(!this.query||String(r.contract_id).includes(this.query.trim()))&&(!this.fromDate||r.renewal_date>=this.fromDate)&&(!this.toDate||r.renewal_date<=this.toDate))}
 setStatus(r:Renewal,status:string){this.svc.setStatus(r.id,status).subscribe({next:x=>this.renewals.set(this.renewals().map(y=>y.id===x.id?x:y)),error:e=>this.error.set(apiErrorMessage(e,'Unable to update renewal status.'))})}
 complete(r:Renewal){const nextExpiry=prompt('Enter the new expiry date (YYYY-MM-DD):',r.new_expiry_date);if(!nextExpiry)return;this.svc.renew(r.id,nextExpiry).subscribe({next:x=>this.renewals.set(this.renewals().map(y=>y.id===x.id?x:y)),error:e=>this.error.set(apiErrorMessage(e,'Unable to complete renewal.'))})}
}
