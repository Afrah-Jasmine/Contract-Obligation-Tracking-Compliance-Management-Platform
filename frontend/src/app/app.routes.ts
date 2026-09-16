import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./features/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent)
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'contracts',
        loadComponent: () => import('./features/placeholders/contracts.component').then(m => m.ContractsComponent)
      },
      {
        path: 'obligations',
        loadComponent: () => import('./features/placeholders/obligations.component').then(m => m.ObligationsComponent)
      },
      {
        path: 'renewals',
        loadComponent: () => import('./features/placeholders/renewals.component').then(m => m.RenewalsComponent)
      },
      {
        path: 'compliance',
        loadComponent: () => import('./features/placeholders/compliance.component').then(m => m.ComplianceComponent)
      },
      {
        path: 'notifications',
        loadComponent: () => import('./features/placeholders/notifications.component').then(m => m.NotificationsComponent)
      },
      {
        path: 'reports',
        loadComponent: () => import('./features/placeholders/reports.component').then(m => m.ReportsComponent)
      },
      {
        path: 'audit',
        canActivate: [roleGuard(['Administrator', 'Legal Manager', 'Compliance Officer'])],
        loadComponent: () => import('./features/placeholders/audit.component').then(m => m.AuditComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
