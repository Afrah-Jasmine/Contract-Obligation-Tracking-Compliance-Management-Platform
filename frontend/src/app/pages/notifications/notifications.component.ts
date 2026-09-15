import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { NotificationsService } from '../../core/data.service';
import { AppNotification } from '../../core/models';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { StatusChipComponent } from '../../shared/ui/status-chip.component';
import { LoadingStateComponent } from '../../shared/ui/loading-state.component';
import { apiErrorMessage } from '../../core/error.util';

@Component({
 selector:'app-notifications',standalone:true,
 imports:[CommonModule,RouterLink,MatButtonModule,MatCardModule,MatIconModule,PageHeaderComponent,StatusChipComponent,LoadingStateComponent],
 template:`
 <app-page-header title="Notifications" subtitle="Renewal reminders, obligation alerts, compliance and approval notices."><button mat-stroked-button *ngIf="unreadCount()" (click)="markAll()">Mark all as read</button></app-page-header>
 <div class="error" *ngIf="error()">{{error()}}</div><app-loading-state *ngIf="loading()"></app-loading-state>
 <mat-card class="panel" *ngIf="!loading()"><div class="row" *ngFor="let n of items()" [class.unread]="n.status==='Unread'"><div class="icon"><mat-icon>{{icon(n.notification_type)}}</mat-icon></div><div class="body"><div><app-status-chip [status]="n.status"></app-status-chip><span class="type">{{n.notification_type}}</span></div><strong>{{n.title}}</strong><p>{{n.message}}</p><small>{{n.created_at|date:'medium'}}</small></div><div><button mat-stroked-button *ngIf="n.status==='Unread'" (click)="markRead(n)">Mark read</button><a mat-button *ngIf="n.contract_id" [routerLink]="['/contracts',n.contract_id]">Open contract</a></div></div>
 <div class="empty" *ngIf="!items().length"><mat-icon>notifications_none</mat-icon><strong>No notifications</strong><span>You're all caught up.</span></div></mat-card>
 `,
 styles:[`.panel{padding:0;overflow:hidden}.row{display:flex;gap:14px;align-items:flex-start;padding:16px 18px;border-bottom:1px solid var(--line)}.row.unread{background:#fafaf7;border-left:4px solid var(--seal)}.icon{width:34px;height:34px;border-radius:50%;background:var(--slate-soft);display:grid;place-items:center;flex:0 0 auto}.body{flex:1;min-width:0}.body>div{display:flex;align-items:center;gap:8px}.type{font-size:11.5px;color:var(--ink-soft)}.body strong{display:block;margin:6px 0 2px}.body p{margin:0 0 4px;color:var(--ink-soft);font-size:13px}.body small{color:var(--ink-soft)}.empty{min-height:260px;display:flex;flex-direction:column;align-items:center;justify-content:center;color:var(--ink-soft);gap:4px}.empty mat-icon{font-size:36px;width:36px;height:36px}.empty strong{font:600 17px var(--font-display);color:var(--ink)}.error{background:var(--rose-soft);color:var(--rose);padding:10px 12px;border-radius:4px;margin-bottom:12px}@media(max-width:650px){.row{flex-wrap:wrap}.row>div:last-child{margin-left:48px}}`]
})
export class NotificationsComponent implements OnInit {
 private svc=inject(NotificationsService);items=signal<AppNotification[]>([]);loading=signal(false);error=signal('');
 unreadCount(){return this.items().filter(n=>n.status==='Unread').length}
 ngOnInit(){this.load()}load(){this.loading.set(true);this.svc.list().subscribe({next:x=>{this.items.set(x);this.loading.set(false)},error:e=>{this.loading.set(false);this.error.set(apiErrorMessage(e,'Unable to load notifications.'))}})}
 markRead(n:AppNotification){this.svc.markRead(n.id).subscribe({next:u=>this.items.set(this.items().map(x=>x.id===u.id?u:x)),error:e=>this.error.set(apiErrorMessage(e,'Unable to mark notification as read.'))})}
 markAll(){this.svc.markAllRead().subscribe({next:()=>this.items.set(this.items().map(x=>({...x,status:'Read' as const}))),error:e=>this.error.set(apiErrorMessage(e,'Unable to mark notifications as read.'))})}
 icon(t:string){if(t.includes('Renewal'))return'event_repeat';if(t.includes('Obligation'))return'task_alt';if(t.includes('Compliance'))return'verified_user';return'notifications'}
}
