import { Routes } from '@angular/router';

import { Dashboard } from './pages/dashboard/dashboard';
import { Contracts } from './pages/contracts/contracts';
import { Obligations } from './pages/obligations/obligations';
import { Renewals } from './pages/renewals/renewals';
import { Compliance } from './pages/compliance/compliance';
import { Notifications } from './pages/notifications/notifications';
import { Reports } from './pages/reports/reports';
import { AuditHistory } from './pages/audit-history/audit-history';

import { Login } from './pages/auth/login/login';
import { Register } from './pages/auth/register/register';
import { ForgotPassword } from './pages/auth/forgot-password/forgot-password';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'forgot-password', component: ForgotPassword },

  { path: 'dashboard', component: Dashboard, canActivate: [authGuard] },
{ path: 'contracts', component: Contracts, canActivate: [authGuard] },
{ path: 'obligations', component: Obligations, canActivate: [authGuard] },
{ path: 'renewals', component: Renewals, canActivate: [authGuard] },
{ path: 'compliance', component: Compliance, canActivate: [authGuard] },
{ path: 'notifications', component: Notifications, canActivate: [authGuard] },
{ path: 'reports', component: Reports, canActivate: [authGuard] },
{ path: 'audit-history', component: AuditHistory, canActivate: [authGuard] },
  { path: '**', redirectTo: 'login' }
];