import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ComplianceService } from '../../core/data.service';
import { ComplianceListItem, ComplianceSummary, HighRiskContract, NonCompliantContract } from '../../core/models';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { LoadingStateComponent } from '../../shared/ui/loading-state.component';
import { StatusChipComponent } from '../../shared/ui/status-chip.component';
import { apiErrorMessage } from '../../core/error.util';

@Component({
 selector:'app-compliance',standalone:true,
 imports:[CommonModule,RouterLink,MatCardModule,MatButtonModule,MatProgressBarModule,PageHeaderComponent,LoadingStateComponent,StatusChipComponent],
 template:`
 <app-page-header title="Compliance" subtitle="Live compliance and risk status computed from contract obligations."><button mat-stroked-button (click)="load()">Refresh</button></app-page-header>
 <div class="error" *ngIf="error()">{{error()}}</div><app-loading-state *ngIf="loading()"></app-loading-state>
 <ng-container *ngIf="summary() as s">
 <section class="stats"><mat-card><span>Total</span><strong>{{s.total_contracts}}</strong></mat-card><mat-card><span>Compliant</span><strong>{{s.compliant_contracts}}</strong></mat-card><mat-card><span>Delayed</span><strong>{{s.delayed_contracts}}</strong></mat-card><mat-card class="risk"><span>High risk</span><strong>{{s.high_risk_contracts}}</strong></mat-card></section>
 <section class="grid"><mat-card><h2>Compliance by contract</h2><div class="table-wrap" *ngIf="list().length;else none"><table><thead><tr><th>Contract</th><th>Status</th><th>Score</th></tr></thead><tbody><tr *ngFor="let c of list()"><td><a [routerLink]="['/contracts',c.contract_id]">{{c.contract_number}}</a></td><td><app-status-chip [status]="c.compliance_status"></app-status-chip></td><td><div class="score-line"><mat-progress-bar mode="determinate" [value]="c.compliance_score"></mat-progress-bar><span>{{c.compliance_score|number:'1.0-0'}}%</span></div></td></tr></tbody></table></div><ng-template #none><p class="empty">No compliance records found.</p></ng-template></mat-card>
 <mat-card><h2>High-risk contracts</h2><div class="list" *ngIf="highRisk().length;else noRisk"><a *ngFor="let c of highRisk()" [routerLink]="['/contracts',c.contract_id]"><span class="docket">{{c.contract_number}}</span><app-status-chip [status]="c.risk_level"></app-status-chip><span class="muted">{{c.overdue_obligations}} overdue</span></a></div><ng-template #noRisk><p class="empty">No high-risk contracts right now.</p></ng-template></mat-card></section>
 </ng-container>
 `,
 styles:[`.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:16px}.stats mat-card{padding:16px;border-left:4px solid var(--seal)}.stats .risk{border-left-color:var(--rose)}.stats span{display:block;color:var(--ink-soft);font-size:12px}.stats strong{display:block;font:600 30px var(--font-display);margin-top:5px}.grid{display:grid;grid-template-columns:1.4fr 1fr;gap:16px}.grid mat-card{padding:0;overflow:hidden}.grid h2{font:600 18px var(--font-display);margin:0;padding:17px 18px;border-bottom:1px solid var(--line)}.table-wrap{overflow:auto}table{width:100%;border-collapse:collapse}th{text-align:left;font-size:12px;color:var(--ink-soft);padding:12px 16px;border-bottom:1px solid var(--line)}td{padding:12px 16px;border-bottom:1px solid var(--line);font-size:13px}.score-line{display:flex;align-items:center;gap:8px;min-width:150px}.score-line mat-progress-bar{flex:1}.score-line span{font-family:var(--font-mono);font-size:11px}.list{padding:5px 18px 16px}.list a{display:flex;gap:9px;align-items:center;padding:11px 0;border-bottom:1px solid var(--line);text-decoration:none;font-size:13px}.list a:last-child{border:0}.list a span:nth-child(2){margin-left:auto}.docket{font:500 11.5px var(--font-mono)}.empty{padding:18px;color:var(--ink-soft);font-size:13px}.error{background:var(--rose-soft);color:var(--rose);padding:10px 12px;border-radius:4px;margin-bottom:12px}@media(max-width:850px){.stats{grid-template-columns:1fr 1fr}.grid{grid-template-columns:1fr}}@media(max-width:500px){.stats{grid-template-columns:1fr}}`]
})
export class ComplianceComponent implements OnInit {
 private svc=inject(ComplianceService);summary=signal<ComplianceSummary|null>(null);list=signal<ComplianceListItem[]>([]);highRisk=signal<HighRiskContract[]>([]);nonCompliant=signal<NonCompliantContract[]>([]);loading=signal(false);error=signal('');
 ngOnInit(){this.load()}load(){this.loading.set(true);this.error.set('');this.svc.summary().subscribe({next:x=>{this.summary.set(x);this.loading.set(false)},error:e=>{this.loading.set(false);this.error.set(apiErrorMessage(e,'Unable to load compliance.'))}});this.svc.list().subscribe({next:x=>this.list.set(x)});this.svc.highRisk().subscribe({next:x=>this.highRisk.set(x)});this.svc.nonCompliant().subscribe({next:x=>this.nonCompliant.set(x)})}
}
