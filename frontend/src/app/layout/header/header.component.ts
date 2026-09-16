import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatBadgeModule,
    MatDividerModule
  ],
  template: `
    <mat-toolbar class="header-toolbar">
      <button mat-icon-button (click)="toggleSidebar.emit()" aria-label="Toggle Menu">
        <mat-icon>menu</mat-icon>
      </button>

      <div class="logo-brand">
        <mat-icon class="brand-icon">shield</mat-icon>
        <span class="brand-title">Contract<span class="brand-accent">IQ</span></span>
      </div>

      <span class="spacer"></span>

      <button mat-icon-button matBadge="3" matBadgeColor="warn" aria-label="Notifications" routerLink="/notifications">
        <mat-icon>notifications</mat-icon>
      </button>

      <div class="user-profile-menu" *ngIf="user(); let u">
        <button mat-button [matMenuTriggerFor]="profileMenu" class="user-btn">
          <div class="user-avatar">{{ u.name.charAt(0).toUpperCase() }}</div>
          <div class="user-info">
            <span class="user-name">{{ u.name }}</span>
            <span class="user-role">{{ u.role }}</span>
          </div>
          <mat-icon>arrow_drop_down</mat-icon>
        </button>

        <mat-menu #profileMenu="matMenu" xPosition="before">
          <div class="menu-header">
            <strong>{{ u.name }}</strong>
            <small>{{ u.email }}</small>
          </div>
          <mat-divider></mat-divider>
          <button mat-menu-item routerLink="/dashboard">
            <mat-icon>dashboard</mat-icon>
            <span>Dashboard</span>
          </button>
          <button mat-menu-item (click)="logout()">
            <mat-icon color="warn">logout</mat-icon>
            <span>Logout</span>
          </button>
        </mat-menu>
      </div>
    </mat-toolbar>
  `,
  styles: [`
    .header-toolbar {
      background-color: #ffffff;
      color: #0f172a;
      height: 64px;
      padding: 0 16px;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);
      border-bottom: 1px solid #e2e8f0;
      position: sticky;
      top: 0;
      z-index: 1000;
    }
    .logo-brand {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-left: 8px;
    }
    .brand-icon {
      color: #0284c7;
    }
    .brand-title {
      font-size: 1.25rem;
      font-weight: 800;
      letter-spacing: -0.5px;
      color: #0f172a;
    }
    .brand-accent {
      color: #0284c7;
    }
    .spacer {
      flex: 1 1 auto;
    }
    .user-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #0f172a;
      height: 44px;
      border-radius: 22px;
      padding: 0 12px;

      &:hover {
        background-color: #f1f5f9;
      }
    }
    .user-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background-color: #0284c7;
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.875rem;
    }
    .user-info {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      line-height: 1.2;
    }
    .user-name {
      font-size: 0.875rem;
      font-weight: 600;
      color: #0f172a;
    }
    .user-role {
      font-size: 0.7rem;
      color: #64748b;
      font-weight: 500;
    }
    .menu-header {
      padding: 12px 16px;
      display: flex;
      flex-direction: column;
      background-color: #f8fafc;
    }
  `]
})
export class HeaderComponent {
  @Output() toggleSidebar = new EventEmitter<void>();
  user = this.authService.currentUser;

  constructor(private authService: AuthService) {}

  logout(): void {
    this.authService.logout();
  }
}
