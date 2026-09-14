import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { ContractsService, ObligationsService, RenewalsService } from '../../core/data.service';
import { AuthService } from '../../core/auth.service';
import { Contract, ObligationListItem, Renewal, ContractCompliance } from '../../core/models';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { LoadingStateComponent } from '../../shared/ui/loading-state.component';
import { StatusChipComponent } from '../../shared/ui/status-chip.component';
import { apiErrorMessage } from '../../core/error.util';

@Component({
 selector:'app-contract-detail',standalone:true,
 imports:[CommonModule,RouterLink,MatButtonModule,MatCardModule,MatDividerModule,PageHeaderComponent,LoadingStateComponent,StatusChipComponent],
 template:`
 <app-loading-state *ngIf="loading()"></app-loading-state>
 <ng-container *ngIf="contract() as c">
   <app-page-header [title]="c.title" [subtitle]="c.contract_number+' · '+c.category">
     <div class="actions"><a mat-stroked-button [routerLink]="['/contracts',c.id,'edit']">Edit</a><button mat-stroked-button *ngIf="c.status==='Draft'" (click)="run(svc.submitReview(c.id))">Submit for review</button><button mat-stroked-button *ngIf="c.status==='Under Review' && auth.hasRole('Administrator','Legal Manager')" (click)="run(svc.approve(c.id))">Approve</button><button mat-flat-button color="primary" *ngIf="c.status==='Approved' && auth.hasRole('Administrator','Legal Manager','Contract Manager')" (click)="run(svc.activate(c.id))">Activate</button></div>
   </app-page-header>
   <div class="error" *ngIf="error()">{{error()}}</div>
   <section class="grid">
     <mat-card><h2>Contract terms</h2><dl><div><dt>Status</dt><dd><app-status-chip [status]="c.status"></app-status-chip></dd></div><div><dt>Category</dt><dd>{{c.category}}</dd></div><div><dt>Start date</dt><dd>{{c.start_date|date:'mediumDate'}}</dd></div><div><dt>End date</dt><dd>{{c.end_date|date:'mediumDate'}}</dd></div><div><dt>Description</dt><dd>{{c.description||'—'}}</dd></div><div><dt>Created</dt><dd>{{c.created_at|date:'medium'}}</dd></div></dl></mat-card>
     <mat-card *ngIf="compliance() as comp"><h2>Compliance</h2><div class="score"><strong>{{comp.compliance_score|number:'1.0-0'}}%</strong><app-status-chip [status]="comp.compliance_status"></app-status-chip></div><div class="metrics"><span><b>{{comp.completed_obligations}}</b> completed</span><span><b>{{comp.pending_obligations}}</b> pending</span><span><b>{{comp.overdue_obligations}}</b> overdue</span><span><b>{{comp.risk_level}}</b> risk</span></div></mat-card>
   </section>
   <mat-card class="section"><div class="section-head"><h2>Obligations</h2><a mat-flat-button color="primary" [routerLink]="['/obligations/new']" [queryParams]="{contractId:c.id}">Add obligation</a></div><div class="table-wrap" *ngIf="obligations().length;else noObl"><table><thead><tr><th>Title</th><th>Type</th><th>Due</th><th>Status</th><th></th></tr></thead><tbody><tr *ngFor="let o of obligations()"><td>{{o.title}}</td><td>{{o.obligation_type}}</td><td>{{o.due_date|date:'mediumDate'}}</td><td><app-status-chip [status]="o.status"></app-status-chip></td><td><a mat-stroked-button [routerLink]="['/obligations',o.id]">Open</a></td></tr></tbody></table></div><ng-template #noObl><p class="empty">No obligations recorded for this contract yet.</p></ng-template></mat-card>
   <mat-card class="section"><div class="section-head"><h2>Renewals</h2><a mat-stroked-button routerLink="/renewals">Manage renewals</a></div><div class="table-wrap" *ngIf="renewals().length;else noRen"><table><thead><tr><th>Renewal date</th><th>Previous expiry</th><th>New expiry</th><th>Status</th></tr></thead><tbody><tr *ngFor="let r of renewals()"><td>{{r.renewal_date|date:'mediumDate'}}</td><td>{{r.previous_expiry_date|date:'mediumDate'}}</td><td>{{r.new_expiry_date|date:'mediumDate'}}</td><td><app-status-chip [status]="r.status"></app-status-chip></td></tr></tbody></table></div><ng-template #noRen><p class="empty">No renewal history yet.</p></ng-template></mat-card>
 </ng-container>
 <div class="error" *ngIf="!loading()&&!contract()&&!error()">Contract not found.</div>
 `,
 styles:[`
 .actions{display:flex;gap:8px;flex-wrap:wrap}.grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}.grid mat-card,.section{padding:0}.grid mat-card h2,.section h2{font:600 18px var(--font-display);margin:0;padding:17px 18px;border-bottom:1px solid var(--line)}dl{margin:0;padding:8px 18px 16px}dl div{display:grid;grid-template-columns:130px 1fr;gap:12px;padding:10px 0;border-bottom:1px solid var(--line)}dl div:last-child{border:0}dt{color:var(--ink-soft);font-size:13px}dd{margin:0;font-size:13.5px}.score{padding:18px;display:flex;align-items:center;gap:12px}.score strong{font:600 34px var(--font-display)}.metrics{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;padding:0 18px 18px}.metrics span{border:1px solid var(--line);padding:10px;border-radius:4px;font-size:12px;color:var(--ink-soft)}.metrics b{color:var(--ink);font-family:var(--font-mono);margin-right:4px}.section{margin-top:16px}.section-head{display:flex;align-items:center;justify-content:space-between;padding:13px 18px;border-bottom:1px solid var(--line)}.section-head h2{border:0;padding:0}.table-wrap{overflow:auto}table{width:100%;border-collapse:collapse}th{text-align:left;font-size:12px;color:var(--ink-soft);padding:11px 16px;border-bottom:1px solid var(--line)}td{padding:12px 16px;border-bottom:1px solid var(--line);font-size:13px;white-space:nowrap}.empty{padding:18px;color:var(--ink-soft);font-size:13px}.error{background:var(--rose-soft);color:var(--rose);padding:10px 12px;border-radius:4px;margin-bottom:12px;font-size:13px}@media(max-width:800px){.grid{grid-template-columns:1fr}.actions{align-self:stretch}}
 `]
})
export class ContractDetailComponent implements OnInit {
 svc=inject(ContractsService);auth=inject(AuthService);private obligationsSvc=inject(ObligationsService);private renewalsSvc=inject(RenewalsService);private route=inject(ActivatedRoute);
 contract=signal<Contract|null>(null);compliance=signal<ContractCompliance|null>(null);obligations=signal<ObligationListItem[]>([]);renewals=signal<Renewal[]>([]);loading=signal(false);error=signal('');
 id=0;
 ngOnInit(){this.id=Number(this.route.snapshot.paramMap.get('id'));this.load()}
 load(){this.loading.set(true);this.error.set('');this.svc.get(this.id).subscribe({next:c=>{this.contract.set(c);this.loading.set(false)},error:e=>{this.loading.set(false);this.error.set(apiErrorMessage(e,'Unable to load contract.'))}});this.svc.compliance(this.id).subscribe({next:x=>this.compliance.set(x)});this.obligationsSvc.forContract(this.id).subscribe({next:x=>this.obligations.set(x)});this.renewalsSvc.forContract(this.id).subscribe({next:x=>this.renewals.set(x)})}
 run(request:any){this.error.set('');request.subscribe({next:()=>this.load(),error:(e:any)=>this.error.set(apiErrorMessage(e,'That action could not be completed.'))})}
}
