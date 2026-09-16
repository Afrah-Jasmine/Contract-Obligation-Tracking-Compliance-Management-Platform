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
      background-color: #ffffff;
      color: #475569;
      padding-top: 12px;
      border-right: 1px solid #e2e8f0;
    }
    .nav-link {
      color: #475569 !important;
      border-left: 4px solid transparent;
      margin: 4px 8px;
      border-radius: 8px;
      font-weight: 500;
      transition: all 0.15s ease-in-out;

      mat-icon {
        color: #64748b !important;
      }

      &:hover {
        background-color: #f1f5f9;
        color: #0f172a !important;

        mat-icon {
          color: #0284c7 !important;
        }
      }
    }
    .active-link {
      background-color: #e0f2fe !important;
      color: #0284c7 !important;
      border-left-color: #0284c7;
      font-weight: 700;

      mat-icon {
        color: #0284c7 !important;
      }
    }
    .my-2 {
      margin: 16px 0;
      border-color: #e2e8f0;
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
