import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivityService } from '../../core/data.service';
import { Activity, AuditLog } from '../../core/models';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { LoadingStateComponent } from '../../shared/ui/loading-state.component';
import { apiErrorMessage } from '../../core/error.util';

@Component({
 selector:'app-activity',standalone:true,
 imports:[CommonModule,MatCardModule,MatButtonModule,MatIconModule,PageHeaderComponent,LoadingStateComponent],
 template:`
 <app-page-header title="Audit / Activity" subtitle="Who did what, to which entity, and when."><button mat-stroked-button (click)="load()">Refresh</button></app-page-header>
 <div class="error" *ngIf="error()">{{error()}}</div><app-loading-state *ngIf="loading()"></app-loading-state>
 <section class="grid" *ngIf="!loading()"><mat-card><h2>Recent activity</h2><div class="feed" *ngIf="activities().length;else noActivity"><div *ngFor="let a of activities()"><mat-icon>history</mat-icon><div><strong>{{a.user_name}}</strong><span>{{a.description}}</span><small>{{a.created_at|date:'medium'}}</small></div></div></div><ng-template #noActivity><p class="empty">No activity has been recorded yet.</p></ng-template></mat-card>
 <mat-card><h2>Audit history</h2><div class="feed" *ngIf="audits().length;else noAudit"><div *ngFor="let a of audits()"><mat-icon>fact_check</mat-icon><div><strong>{{a.user_name||'System'}} · {{a.action}}</strong><span>{{a.entity_type||'—'}}{{a.entity_id ? ' #'+a.entity_id : ''}}</span><small>{{a.details||'No additional details'}} · {{a.created_at|date:'medium'}}</small></div></div></div><ng-template #noAudit><p class="empty">No audit records have been recorded yet.</p></ng-template></mat-card></section>
 `,
 styles:[`.grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}.grid mat-card{padding:0;overflow:hidden}.grid h2{font:600 18px var(--font-display);margin:0;padding:17px 18px;border-bottom:1px solid var(--line)}.feed{padding:6px 18px 16px}.feed>div{display:flex;gap:12px;padding:12px 0;border-bottom:1px solid var(--line)}.feed>div:last-child{border:0}.feed mat-icon{color:var(--seal);margin-top:2px}.feed strong,.feed span,.feed small{display:block}.feed strong{font-size:13px}.feed span{font-size:13px;margin:2px 0;color:var(--ink)}.feed small{font-size:11.5px;color:var(--ink-soft)}.empty{padding:20px;color:var(--ink-soft);font-size:13px}.error{background:var(--rose-soft);color:var(--rose);padding:10px 12px;border-radius:4px;margin-bottom:12px}@media(max-width:800px){.grid{grid-template-columns:1fr}}`]
})
export class ActivityComponent implements OnInit {
 private svc=inject(ActivityService);activities=signal<Activity[]>([]);audits=signal<AuditLog[]>([]);loading=signal(false);error=signal('');
 ngOnInit(){this.load()}load(){this.loading.set(true);this.error.set('');let count=0;this.svc.list().subscribe({next:x=>this.activities.set(x),error:e=>this.error.set(apiErrorMessage(e,'Unable to load activity.')),complete:()=>{if(++count===2)this.loading.set(false)}});this.svc.audit().subscribe({next:x=>this.audits.set(x),error:e=>this.error.set(apiErrorMessage(e,'Unable to load audit history.')),complete:()=>{if(++count===2)this.loading.set(false)}})}
}
