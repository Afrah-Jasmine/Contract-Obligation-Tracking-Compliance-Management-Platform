import { Routes } from '@angular/router';

import { Login } from './login/login';
import { Dashboard } from './dashboard/dashboard';
import { MainLayout } from './layout/main-layout/main-layout';
import { Contracts } from './contracts/contracts';
import { Obligations } from './obligations/obligations';
import { Renewals } from './renewals/renewals';
import { CompliancePage } from './compliance-page/compliance-page';
import { Notifications } from './notifications/notifications';
import { ReportsPage } from './reports-page/reports-page';
import { AuditHistory } from './audit-history/audit-history';
import { authGuard } from './auth-guard';
import { ForgotPassword } from './forgot-password/forgot-password';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },

  {
    path: 'login',
    component: Login
  },
  {
  path: 'forgot-password',
  component: ForgotPassword
},
  {
    path: '',
    component: MainLayout,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        component: Dashboard
      },
      {
        path: 'contracts',
        component: Contracts
      },
      {
        path: 'obligations',
        component: Obligations
      },
      {
        path: 'renewals',
        component: Renewals
      },
      {
        path: 'compliance',
        component: CompliancePage
      },
      {
        path: 'notifications',
        component: Notifications
      },
      {
        path: 'reports',
        component: ReportsPage
      },
      {
        path: 'audit-history',
        component: AuditHistory
      }
    ]
  }
];