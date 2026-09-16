import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../core/services/auth.service';

interface NavItem {
  label: string;
  route: string;
  icon: string;
  roles?: string[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatListModule,
    MatIconModule,
    MatDividerModule
  ],
  template: `
    <nav class="sidebar-nav">
      <mat-nav-list>
        <ng-container *ngFor="let item of navItems">
          <a
            mat-list-item
            [routerLink]="item.route"
            routerLinkActive="active-link"
            *ngIf="canViewItem(item)"
            class="nav-link"
          >
            <mat-icon matListItemIcon>{{ item.icon }}</mat-icon>
            <span matListItemTitle>{{ item.label }}</span>
          </a>
        </ng-container>

        <mat-divider class="my-2"></mat-divider>

        <a mat-list-item (click)="logout()" class="nav-link logout-link">
          <mat-icon matListItemIcon color="warn">logout</mat-icon>
          <span matListItemTitle class="text-rose-600">Logout</span>
        </a>
      </mat-nav-list>
    </nav>
  `,
  styles: [`
    .sidebar-nav {
      width: 240px;
      height: 100%;
      background-color: #0f172a;
      color: #94a3b8;
      padding-top: 8px;
    }
    .nav-link {
      color: #94a3b8 !important;
      border-left: 4px solid transparent;
      margin: 4px 8px;
      border-radius: 6px;

      &:hover {
        background-color: #1e293b;
        color: #f8fafc !important;
      }
    }
    .active-link {
      background-color: #1e293b !important;
      color: #38bdf8 !important;
      border-left-color: #38bdf8;
      font-weight: 600;

      mat-icon {
        color: #38bdf8 !important;
      }
    }
    .my-2 {
      margin: 16px 0;
      border-color: #334155;
    }
  `]
})
export class SidebarComponent {
  navItems: NavItem[] = [
    { label: 'Dashboard', route: '/dashboard', icon: 'dashboard' },
    { label: 'Contracts', route: '/contracts', icon: 'description' },
    { label: 'Obligations', route: '/obligations', icon: 'assignment' },
    { label: 'Renewals', route: '/renewals', icon: 'autorenew' },
    { label: 'Compliance', route: '/compliance', icon: 'gavel' },
    { label: 'Notifications', route: '/notifications', icon: 'notifications' },
    { label: 'Reports', route: '/reports', icon: 'bar_chart' },
    { label: 'Audit History', route: '/audit', icon: 'history', roles: ['Administrator', 'Legal Manager', 'Compliance Officer'] }
  ];

  constructor(private authService: AuthService) {}

  canViewItem(item: NavItem): boolean {
    if (!item.roles || item.roles.length === 0) return true;
    return this.authService.hasRole(item.roles);
  }

  logout(): void {
    this.authService.logout();
  }
}
