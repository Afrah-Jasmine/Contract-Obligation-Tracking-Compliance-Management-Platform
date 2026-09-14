import { Routes } from '@angular/router';

import { Layout } from './layout/layout';
import { Dashboard } from './dashboard/dashboard';
import { Login } from './login/login';
import { Contracts } from './contracts/contracts';
import { Obligations } from './obligations/obligations';
import { Renewals } from './renewals/renewals';
import { Compliance } from './compliance/compliance';
import { Notifications } from './notifications/notifications';
import { Reports } from './reports/reports';
import { Audit } from './audit/audit';
import { Users } from './users/users';

import { authGuard } from './guards/auth-guard';
import { roleGuard } from './guards/role-guard';

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
    path: '',
    component: Layout,
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
        component: Compliance
      },

      {
        path: 'notifications',
        component: Notifications
      },

      {
        path: 'reports',
        component: Reports
      },

      {
        path: 'audit',
        component: Audit
      },

      {
        path: 'users',
        component: Users,
        canActivate: [roleGuard],
        data: {
          roles: ['ADMINISTRATOR']
        }
      }

    ]
  },

  {
    path: '**',
    redirectTo: 'dashboard'
  }

];