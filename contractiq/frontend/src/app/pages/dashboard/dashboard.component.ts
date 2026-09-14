import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ReportsService } from '../../core/data.service';
import { AuthService } from '../../core/auth.service';
import { DashboardSummary } from '../../core/models';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { LoadingStateComponent } from '../../shared/ui/loading-state.component';
import { StatusChipComponent } from '../../shared/ui/status-chip.component';
import { apiErrorMessage } from '../../core/error.util';

@Component({
 selector:'app-dashboard',standalone:true,
 imports:[CommonModule,RouterLink,MatCardModule,MatButtonModule,MatProgressBarModule,PageHeaderComponent,LoadingStateComponent,StatusChipComponent],
 template:`
 <app-page-header title="Dashboard" subtitle="Live contract, obligation, renewal and compliance overview.">
   <button mat-stroked-button (click)="load()">Refresh</button>
 </app-page-header>
 <div class="error" *ngIf="error()">{{error()}}</div>
 <app-loading-state *ngIf="loading()"></app-loading-state>
 <ng-container *ngIf="data() as d">
   <section class="stats">
     <a routerLink="/contracts"><mat-card><span>Total contracts</span><strong>{{d.contracts.total}}</strong><small>{{d.contracts.active}} active · {{d.contracts.expired}} expired</small></mat-card></a>
     <a routerLink="/contracts"><mat-card><span>Active contracts</span><strong>{{d.contracts.active}}</strong><small>{{pct(d.contracts.active,d.contracts.total)}}% of repository</small></mat-card></a>
     <a routerLink="/obligations"><mat-card><span>Pending obligations</span><strong>{{d.obligations.pending + d.obligations.in_progress}}</strong><small>{{d.obligations.overdue}} overdue</small></mat-card></a>
     <a routerLink="/renewals"><mat-card><span>Upcoming renewals</span><strong>{{d.renewals.upcoming}}</strong><small>next {{d.renewals.upcoming_days}} days</small></mat-card></a>
     <a routerLink="/compliance"><mat-card class="risk"><span>High-risk contracts</span><strong>{{d.compliance.risk_indicators.high}}</strong><small>{{d.compliance.non_compliant}} non-compliant</small></mat-card></a>
   </section>
   <section class="grid">
     <mat-card><h2>Contract status distribution</h2><div class="bars">
       <div *ngFor="let s of contractStatuses" class="bar"><div><span>{{s.label}}</span><b>{{d.contracts[s.key]}}</b></div><mat-progress-bar mode="determinate" [value]="pct(d.contracts[s.key],d.contracts.total)"></mat-progress-bar></div>
     </div></mat-card>
     <mat-card><h2>Obligation status distribution</h2><div class="bars">
       <div *ngFor="let s of obligationStatuses" class="bar"><div><span>{{s.label}}</span><b>{{d.obligations[s.key]}}</b></div><mat-progress-bar mode="determinate" [value]="pct(d.obligations[s.key],d.obligations.total)"></mat-progress-bar></div>
     </div></mat-card>
     <mat-card><h2>Compliance & risk</h2><div class="risk-grid">
       <div><strong>{{d.compliance.compliant}}</strong><span>Compliant</span></div>
       <div><strong>{{d.compliance.risk_indicators.medium}}</strong><span>Medium risk</span></div>
       <div class="high"><strong>{{d.compliance.risk_indicators.high}}</strong><span>High risk</span></div>
     </div>
     <div class="list" *ngIf="d.compliance.high_risk_contracts.length; else noRisk"><a *ngFor="let c of d.compliance.high_risk_contracts" [routerLink]="['/contracts',c.contract_id]"><span class="docket">{{c.contract_number}}</span><span>{{c.contract_title}}</span><app-status-chip [status]="c.risk_level"></app-status-chip></a></div>
     <ng-template #noRisk><p class="empty">No high-risk contracts right now.</p></ng-template></mat-card>
     <mat-card><h2>Approaching expiry</h2><div class="list" *ngIf="d.renewals.approaching_expiry.length; else noExpiry"><a *ngFor="let c of d.renewals.approaching_expiry" [routerLink]="['/contracts',c.contract_id]"><span><b class="docket">{{c.contract_number}}</b> {{c.contract_title}}</span><app-status-chip [status]="c.days_remaining <= 30 ? 'High' : 'Upcoming'"></app-status-chip><span class="muted">{{c.days_remaining}} days</span></a></div><ng-template #noExpiry><p class="empty">No contracts are approaching expiry in the current window.</p></ng-template></mat-card>
   </section>
 </ng-container>
 `,
 styles:[`
 .stats{display:grid;grid-template-columns:repeat(5,1fr);gap:14px;margin-bottom:16px}.stats a{text-decoration:none;color:inherit}.stats mat-card{height:100%;border-left:4px solid var(--seal);padding:16px}.stats .risk{border-left-color:var(--rose)}
 .stats span,.stats small{display:block;color:var(--ink-soft);font-size:12px}.stats strong{display:block;font:600 30px var(--font-display);margin:5px 0}.grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}.grid mat-card{padding:0;overflow:hidden}.grid h2{font:600 17px var(--font-display);padding:17px 18px;margin:0;border-bottom:1px solid var(--line)}
 .bars{padding:12px 18px 16px}.bar{margin:13px 0}.bar>div{display:flex;justify-content:space-between;font-size:13px;margin-bottom:5px}.bar b{font-family:var(--font-mono);font-weight:500}.risk-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;padding:16px}.risk-grid div{border:1px solid var(--line);padding:12px;text-align:center;border-radius:4px}.risk-grid strong{display:block;font:600 24px var(--font-display)}.risk-grid span{font-size:12px;color:var(--ink-soft)}.risk-grid .high{background:var(--rose-soft);border-color:#e3bcb7}.list{padding:4px 18px 15px}.list a{display:flex;gap:9px;align-items:center;padding:10px 0;border-bottom:1px solid var(--line);text-decoration:none;font-size:13px}.list a:last-child{border:0}.list a span:nth-child(2){flex:1}.docket{font-family:var(--font-mono);font-size:11.5px;color:var(--ink-soft)}.empty{padding:16px 18px;color:var(--ink-soft);font-size:13px}.error{background:var(--rose-soft);color:var(--rose);padding:10px 12px;border-radius:4px;margin-bottom:14px}
 @media(max-width:1100px){.stats{grid-template-columns:repeat(3,1fr)}}@media(max-width:800px){.grid{grid-template-columns:1fr}.stats{grid-template-columns:1fr 1fr}}@media(max-width:520px){.stats{grid-template-columns:1fr}}
 `]
})
export class DashboardComponent implements OnInit {
 private reports=inject(ReportsService); auth=inject(AuthService);
 data=signal<DashboardSummary|null>(null);loading=signal(false);error=signal('');
 contractStatuses=[{key:'active',label:'Active'},{key:'draft',label:'Draft'},{key:'under_review',label:'Under review'},{key:'approved',label:'Approved'},{key:'expired',label:'Expired'},{key:'terminated',label:'Terminated'}] as const;
 obligationStatuses=[{key:'pending',label:'Pending'},{key:'in_progress',label:'In progress'},{key:'completed',label:'Completed'},{key:'delayed',label:'Delayed'},{key:'overdue',label:'Overdue'}] as const;
 ngOnInit(){this.load()}
 load(){this.loading.set(true);this.error.set('');this.reports.dashboard().subscribe({next:d=>{this.data.set(d);this.loading.set(false)},error:e=>{this.loading.set(false);this.error.set(apiErrorMessage(e,'Unable to load dashboard.'))}})}
 pct(v:number,total:number){return total?Math.round((v/total)*100):0}
}
