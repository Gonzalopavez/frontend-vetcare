import {
  Routes
} from '@angular/router';

import {
  MsalGuard
} from '@azure/msal-angular';

import {
  Dashboard
} from './pages/dashboard/dashboard';

import {
  Consultations
} from './pages/consultations/consultations';

import {
  ConsultationCreate
} from './pages/consultation-create/consultation-create';

import {
  ConsultationStatus
} from './pages/consultation-status/consultation-status';

import {
  Catalog
} from './pages/catalog/catalog';

import {
  AdminCatalog
} from './pages/admin-catalog/admin-catalog';

import {
  Audit
} from './pages/audit/audit';

import {
  Forbidden
} from './pages/forbidden/forbidden';

import {
  Protected
} from './pages/protected/protected';

import {
  roleGuard
} from './core/auth/role.guard';

export const routes: Routes = [

  {
    path: 'dashboard',

    component: Dashboard,

    canActivate: [
      MsalGuard
    ]
  },

  {
    path: 'consultations',

    component: Consultations,

    canActivate: [
      MsalGuard,
      roleGuard(
        'Admin',
        'Operador',
        'Cliente'
      )
    ]
  },

  {
    path: 'consultations/new',

    component: ConsultationCreate,

    canActivate: [
      MsalGuard,
      roleGuard(
        'Operador',
        'Cliente'
      )
    ]
  },

  {
    path: 'consultations/status',

    component: ConsultationStatus,

    canActivate: [
      MsalGuard,
      roleGuard(
        'Admin',
        'Operador'
      )
    ]
  },

  {
    path: 'catalog',

    component: Catalog,

    canActivate: [
      MsalGuard,
      roleGuard(
        'Admin',
        'Operador'
      )
    ]
  },

  {
    path: 'admin/catalog',

    component: AdminCatalog,

    canActivate: [
      MsalGuard,
      roleGuard(
        'Admin'
      )
    ]
  },

  {
    path: 'audit',

    component: Audit,

    canActivate: [
      MsalGuard,
      roleGuard(
        'Auditor'
      )
    ]
  },

  {
    path: 'protected',

    component: Protected,

    canActivate: [
      MsalGuard
    ]
  },

  {
    path: 'forbidden',

    component: Forbidden
  },

  {
    path: '',

    redirectTo: 'dashboard',

    pathMatch: 'full'
  },

  {
    path: '**',

    redirectTo: 'dashboard'
  }
];