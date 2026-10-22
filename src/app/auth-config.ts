import {
  BrowserCacheLocation,
  Configuration,
  InteractionType,
  IPublicClientApplication,
  PublicClientApplication
} from '@azure/msal-browser';

import {
  MsalGuardConfiguration,
  MsalInterceptorConfiguration
} from '@azure/msal-angular';

import {
  apiConfig
} from './core/config/api.config';

/**
 * Scopes reales de VetCare registrados en Microsoft Entra ID.
 */
export const vetCareApiScopes = {

  consultasLeer:
    'api://75dfa48a-173a-4c90-8413-e6ac41efbc58/Consultas.leer',

  consultasEscribir:
    'api://75dfa48a-173a-4c90-8413-e6ac41efbc58/Consultas.Escribir',

  catalogoLeer:
    'api://75dfa48a-173a-4c90-8413-e6ac41efbc58/Catalogo.Leer',

  catalogoEscribir:
    'api://75dfa48a-173a-4c90-8413-e6ac41efbc58/Catalogo.Escribir'
};

/**
 * Usa automáticamente el origen actual.
 *
 * Local:
 * http://localhost:4200/
 *
 * AWS Amplify:
 * https://production.d3ry6yi9x6895b.amplifyapp.com/
 */
const appOrigin = `${window.location.origin}/`;

export const msalConfig: Configuration = {

  auth: {

    clientId:
      '76587cb6-60bd-4fd9-afa5-1727ffb6b570',

    authority:
      'https://login.microsoftonline.com/b5cc8e1d-1dbb-4b10-bbf5-da56c099e228',

    redirectUri:
      appOrigin,

    postLogoutRedirectUri:
      appOrigin
  },

  cache: {

    cacheLocation:
      BrowserCacheLocation.SessionStorage
  }
};

/**
 * Instancia principal de Microsoft MSAL.
 */
export function MSALInstanceFactory():
  IPublicClientApplication {

  return new PublicClientApplication(
    msalConfig
  );
}

/**
 * Configuración utilizada por MsalGuard.
 */
export function MSALGuardConfigFactory():
  MsalGuardConfiguration {

  return {

    interactionType:
      InteractionType.Redirect
  };
}

/**
 * Configuración del interceptor.
 *
 * Agrega automáticamente:
 *
 * Authorization: Bearer <token>
 *
 * a las llamadas hacia el BFF/API Gateway.
 */
export function MSALInterceptorConfigFactory():
  MsalInterceptorConfiguration {

  const baseUrl =
    apiConfig.bffBaseUrl;

  const protectedResourceMap =
    new Map<string, Array<string>>();

  /**
   * Perfil VetCare.
   *
   * Se solicitan todos los scopes que utiliza actualmente
   * la aplicación para que Angular pueda conocer
   * correctamente roles y authorities del usuario.
   */
  protectedResourceMap.set(
    `${baseUrl}/api/security/me`,
    [
      vetCareApiScopes.consultasLeer,
      vetCareApiScopes.consultasEscribir,
      vetCareApiScopes.catalogoLeer,
      vetCareApiScopes.catalogoEscribir
    ]
  );

  /**
   * CONSULTATIONS
   *
   * GET:
   * Consultas.leer
   *
   * POST / PUT:
   * Consultas.Escribir
   */
  protectedResourceMap.set(
    `${baseUrl}/api/consultations`,
    [
      vetCareApiScopes.consultasLeer,
      vetCareApiScopes.consultasEscribir
    ]
  );

  protectedResourceMap.set(
    `${baseUrl}/api/consultations/*`,
    [
      vetCareApiScopes.consultasLeer,
      vetCareApiScopes.consultasEscribir
    ]
  );

  /**
   * CATALOG
   *
   * GET:
   * Catalogo.Leer
   *
   * POST / PUT:
   * Catalogo.Escribir
   */
  protectedResourceMap.set(
    `${baseUrl}/api/catalog/services`,
    [
      vetCareApiScopes.catalogoLeer,
      vetCareApiScopes.catalogoEscribir
    ]
  );

  protectedResourceMap.set(
    `${baseUrl}/api/catalog/services/*`,
    [
      vetCareApiScopes.catalogoLeer,
      vetCareApiScopes.catalogoEscribir
    ]
  );

  /**
   * AUDIT
   *
   * Actualmente Entra no tiene un scope
   * Auditoria.Leer independiente.
   *
   * Audit valida principalmente el ROLE_Auditor.
   * Se utiliza Consultas.leer para obtener un
   * Access Token válido destinado a VetCare-API.
   */
  protectedResourceMap.set(
    `${baseUrl}/api/audit/events`,
    [
      vetCareApiScopes.consultasLeer
    ]
  );

  protectedResourceMap.set(
    `${baseUrl}/api/audit/events/*`,
    [
      vetCareApiScopes.consultasLeer
    ]
  );

  return {

    interactionType:
      InteractionType.Redirect,

    protectedResourceMap,

    strictMatching:
      true
  };
}