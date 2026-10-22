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
  ConsultationStatusPage
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
  roleGuard
} from './core/auth/role.guard';


export const routes: Routes = [

  /*
   * ==============================
   * INICIO
   * ==============================
   *
   * Cualquier usuario autenticado
   * puede entrar al dashboard.
   */
  {
    path: 'dashboard',

    component: Dashboard,

    canActivate: [
      MsalGuard
    ]
  },


  /*
   * ==============================
   * CREAR CONSULTA
   * ==============================
   *
   * Operador:
   * puede crear consultas.
   *
   * Cliente:
   * puede crear sus propias consultas.
   */
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


  /*
   * ==============================
   * GESTIÓN DE ESTADOS
   * ==============================
   *
   * Admin y Operador pueden avanzar
   * el estado de una consulta.
   */
  {
    path: 'consultations/status',

    component: ConsultationStatusPage,

    canActivate: [
      MsalGuard,

      roleGuard(
        'Admin',
        'Operador'
      )
    ]
  },


  /*
   * ==============================
   * LISTADO DE CONSULTAS
   * ==============================
   *
   * Admin:
   * ve las consultas.
   *
   * Operador:
   * ve las consultas.
   *
   * Cliente:
   * ve solamente las consultas que
   * el backend le permite ver según
   * su ownerOid.
   */
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


  /*
   * ==============================
   * CATÁLOGO
   * ==============================
   *
   * Admin y Operador pueden navegar
   * por la vista general del catálogo.
   *
   * Cliente no necesita esta pantalla.
   * Solo necesita GET catálogo desde
   * Nueva consulta para seleccionar
   * una prestación.
   */
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


  /*
   * ==============================
   * ADMINISTRAR CATÁLOGO
   * ==============================
   *
   * Exclusivo para Admin.
   */
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


  /*
   * ==============================
   * AUDITORÍA
   * ==============================
   *
   * Exclusivo para Auditor.
   */
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


  /*
   * ==============================
   * ACCESO DENEGADO
   * ==============================
   */
  {
    path: 'forbidden',

    component: Forbidden
  },


  /*
   * Ruta inicial.
   */
  {
    path: '',

    redirectTo: 'dashboard',

    pathMatch: 'full'
  },


  /*
   * Cualquier URL inexistente vuelve
   * al dashboard.
   */
  {
    path: '**',

    redirectTo: 'dashboard'
  }

];