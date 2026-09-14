import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../core/auth.service';
import { NotificationsService } from '../core/data.service';
import { UserRole } from '../core/models';

interface NavItem { label: string; icon: string; path: string; roles?: UserRole[]; }

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    CommonModule, RouterLink, RouterLinkActive, RouterOutlet,
    MatToolbarModule, MatSidenavModule, MatListModule, MatButtonModule,
    MatIconModule, MatBadgeModule, MatMenuModule
  ],
  template: `
  <mat-sidenav-container class="shell">
    <mat-sidenav #drawer class="sidenav" [mode]="isMobile ? 'over' : 'side'" [opened]="!isMobile">
      <div class="brand">
        <div class="brand-mark">CIQ</div>
        <div><strong>ContractIQ</strong><small>Contract • Obligation • Compliance</small></div>
      </div>

      <mat-nav-list>
        <a mat-list-item *ngFor="let item of visibleNav()" [routerLink]="item.path"
           routerLinkActive="active-link" (click)="isMobile && drawer.close()">
          <mat-icon matListItemIcon>{{ item.icon }}</mat-icon>
          <span matListItemTitle>{{ item.label }}</span>
        </a>
      </mat-nav-list>

      <div class="sidenav-foot">
        <div class="who">
          <div class="avatar">{{ initials() }}</div>
          <div><strong>{{ auth.user()?.full_name }}</strong><small>{{ auth.user()?.role }}</small></div>
        </div>
        <button mat-stroked-button (click)="logout()">Logout</button>
      </div>
    </mat-sidenav>

    <mat-sidenav-content>
      <mat-toolbar class="topbar">
        <button mat-icon-button class="menu-button" (click)="drawer.toggle()" aria-label="Open navigation">
          <mat-icon>menu</mat-icon>
        </button>
        <span class="spacer"></span>
        <a mat-icon-button routerLink="/notifications" [matBadge]="unreadCount()" [matBadgeHidden]="unreadCount() === 0"
           matBadgeColor="warn" aria-label="Notifications">
          <mat-icon>notifications_none</mat-icon>
        </a>
        <button mat-button [matMenuTriggerFor]="profileMenu" class="profile-button">
          <span class="top-avatar">{{ initials() }}</span>
          <span class="profile-name">{{ auth.user()?.full_name }}</span>
          <mat-icon>expand_more</mat-icon>
        </button>
        <mat-menu #profileMenu="matMenu">
          <button mat-menu-item routerLink="/profile"><mat-icon>person</mat-icon><span>Profile</span></button>
          <button mat-menu-item (click)="logout()"><mat-icon>logout</mat-icon><span>Logout</span></button>
        </mat-menu>
      </mat-toolbar>

      <main class="content"><router-outlet /></main>
    </mat-sidenav-content>
  </mat-sidenav-container>
  `,
  styles: [`
    .shell{min-height:100vh;background:var(--paper)}
    .sidenav{width:260px;background:var(--ink);color:#dfe6ee}
    .brand{display:flex;align-items:center;gap:11px;padding:20px 18px;border-bottom:1px solid #2b3f5a}
    .brand-mark{background:#d9e0dd;color:var(--ink);font:600 12px var(--font-mono);padding:6px 7px;border-radius:4px}
    .brand strong{display:block;color:white;font-family:var(--font-display);font-size:18px}
    .brand small{display:block;color:#91a2b6;font-size:10.5px;margin-top:2px}
    mat-nav-list{padding:14px 10px}
    mat-nav-list a{color:#bdc8d3;margin:2px 0;border-radius:4px}
    mat-nav-list a mat-icon{color:#91a2b6}
    mat-nav-list a.active-link{background:#1f3654;color:#fff}
    mat-nav-list a.active-link mat-icon{color:#fff}
    .sidenav-foot{position:absolute;bottom:0;left:0;right:0;padding:14px 14px 18px;border-top:1px solid #2b3f5a;background:var(--ink)}
    .who{display:flex;align-items:center;gap:10px;margin-bottom:12px}
    .who strong{display:block;color:#fff;font-size:12.5px}.who small{color:#91a2b6;font-size:10.5px}
    .avatar,.top-avatar{display:grid;place-items:center;border-radius:50%;font-weight:700}
    .avatar{width:34px;height:34px;background:#d9e0dd;color:var(--ink);font-size:12px}
    .sidenav-foot button{width:100%;color:#fff;border-color:#53677f}
    .topbar{position:sticky;top:0;z-index:5;background:var(--surface);border-bottom:1px solid var(--line);color:var(--ink)}
    .menu-button{display:none}
    .spacer{flex:1}
    .profile-button{margin-left:6px}
    .top-avatar{width:28px;height:28px;background:var(--slate-soft);font-size:10px;margin-right:5px}
    .content{padding:28px 32px 56px;max-width:1280px;margin:0 auto;width:100%}
    @media(max-width:800px){.menu-button{display:inline-flex}.sidenav{width:280px}.content{padding:20px 16px 40px}.profile-name{display:none}}
  `]
})
export class ShellComponent implements OnInit {
  auth = inject(AuthService);
  private notifications = inject(NotificationsService);
  private router = inject(Router);
  unreadCount = signal(0);
  isMobile = false;

  private allNav: NavItem[] = [
    { label:'Dashboard', icon:'dashboard', path:'/dashboard' },
    { label:'Contracts', icon:'description', path:'/contracts' },
    { label:'Obligations', icon:'task_alt', path:'/obligations' },
    { label:'Renewals', icon:'event_repeat', path:'/renewals' },
    { label:'Compliance', icon:'verified_user', path:'/compliance' },
    { label:'Notifications', icon:'notifications', path:'/notifications' },
    { label:'Reports & Analytics', icon:'analytics', path:'/reports' },
    { label:'Audit / Activity', icon:'history', path:'/activity' },
    { label:'Users', icon:'group', path:'/users', roles:['Administrator'] },
  ];

  visibleNav(){ return this.allNav.filter(i => !i.roles || this.auth.hasRole(...i.roles)); }

  ngOnInit(){
    this.isMobile = window.innerWidth <= 800;
    window.addEventListener('resize', () => this.isMobile = window.innerWidth <= 800);
    if (!this.auth.user() && this.auth.token) this.auth.fetchMe().subscribe();
    this.refreshNotifications();
  }

  refreshNotifications(){
    this.notifications.list().subscribe({ next:list => this.unreadCount.set(list.filter(n => n.status === 'Unread').length) });
  }

  initials(){
    return (this.auth.user()?.full_name ?? 'U').split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]).join('').toUpperCase();
  }

  logout(){ this.auth.logout(); }
}
