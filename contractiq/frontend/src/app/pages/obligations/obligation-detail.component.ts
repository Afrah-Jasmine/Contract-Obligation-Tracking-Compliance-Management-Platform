import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { ObligationsService } from '../../core/data.service';
import { Obligation, OBLIGATION_STATUSES, ObligationStatus } from '../../core/models';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { LoadingStateComponent } from '../../shared/ui/loading-state.component';
import { StatusChipComponent } from '../../shared/ui/status-chip.component';
import { apiErrorMessage } from '../../core/error.util';

@Component({
 selector:'app-obligation-detail',standalone:true,
 imports:[CommonModule,RouterLink,MatButtonModule,MatCardModule,MatSelectModule,PageHeaderComponent,LoadingStateComponent,StatusChipComponent],
 template:`
 <app-loading-state *ngIf="loading()"></app-loading-state><ng-container *ngIf="item() as o">
 <app-page-header [title]="o.title" [subtitle]="'Obligation #'+o.id+' · Contract #'+o.contract_id"><div class="actions"><a mat-stroked-button [routerLink]="['/obligations',o.id,'edit']">Edit</a><button mat-flat-button color="primary" *ngIf="o.status!=='Completed'" (click)="complete()">Mark complete</button></div></app-page-header>
 <div class="error" *ngIf="error()">{{error()}}</div>
 <mat-card class="card"><div class="status-line"><app-status-chip [status]="o.status"></app-status-chip><mat-select [value]="o.status" (selectionChange)="changeStatus($event.value)" [disabled]="o.status==='Completed'"><mat-option *ngFor="let s of statuses" [value]="s">{{s}}</mat-option></mat-select></div>
 <dl><div><dt>Contract</dt><dd><a [routerLink]="['/contracts',o.contract_id]">Open contract #{{o.contract_id}}</a></dd></div><div><dt>Type</dt><dd>{{o.obligation_type}}</dd></div><div><dt>Due date</dt><dd>{{o.due_date|date:'mediumDate'}}</dd></div><div><dt>Completion</dt><dd>{{o.completion_date?(o.completion_date|date:'mediumDate'):'Not completed'}}</dd></div><div><dt>Description</dt><dd>{{o.description||'—'}}</dd></div></dl></mat-card>
 </ng-container><div class="error" *ngIf="!loading()&&!item()&&!error()">Obligation not found.</div>
 `,
 styles:[`.actions{display:flex;gap:8px}.card{max-width:760px;padding:20px}.status-line{display:flex;justify-content:space-between;align-items:center;gap:12px}.status-line mat-select{width:220px}dl{margin:18px 0 0}dl div{display:grid;grid-template-columns:140px 1fr;gap:12px;padding:11px 0;border-bottom:1px solid var(--line)}dt{color:var(--ink-soft);font-size:13px}dd{margin:0;font-size:13.5px}.error{background:var(--rose-soft);color:var(--rose);padding:10px 12px;border-radius:4px;margin-bottom:12px;font-size:13px}@media(max-width:600px){.status-line{align-items:flex-start;flex-direction:column}.status-line mat-select{width:100%}.actions{flex-wrap:wrap}dl div{grid-template-columns:1fr}}`]
})
export class ObligationDetailComponent implements OnInit {
 private svc=inject(ObligationsService);private route=inject(ActivatedRoute);item=signal<Obligation|null>(null);loading=signal(false);error=signal('');statuses=OBLIGATION_STATUSES;
 ngOnInit(){this.load()}load(){const id=Number(this.route.snapshot.paramMap.get('id'));this.loading.set(true);this.svc.get(id).subscribe({next:o=>{this.item.set(o);this.loading.set(false)},error:e=>{this.loading.set(false);this.error.set(apiErrorMessage(e,'Unable to load obligation.'))}})}
 changeStatus(status:ObligationStatus){const o=this.item();if(!o||status===o.status)return;this.svc.setStatus(o.id,status).subscribe({next:x=>this.item.set(x),error:e=>this.error.set(apiErrorMessage(e,'Invalid status transition.'))})}
 complete(){const o=this.item();if(!o)return;this.svc.complete(o.id).subscribe({next:x=>this.item.set(x),error:e=>this.error.set(apiErrorMessage(e,'Unable to complete the obligation.'))})}
}
