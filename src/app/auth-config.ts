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
 * Scopes de la API VetCare registrados en Microsoft Entra ID.
 */
export const vetCareApiScopes = {
  consultasLeer:
    'api://75dfa48a-173a-4c90-8413-e6ac41efbc58/Consultas.Leer',

  consultasEscribir:
    'api://75dfa48a-173a-4c90-8413-e6ac41efbc58/Consultas.Escribir',

  catalogoLeer:
    'api://75dfa48a-173a-4c90-8413-e6ac41efbc58/Catalogo.Leer',

  catalogoEscribir:
    'api://75dfa48a-173a-4c90-8413-e6ac41efbc58/Catalogo.Escribir'
};

/**
 * Origen actual de la aplicación:
 * - http://localhost:4200 en desarrollo
 * - https://<tu-app>.amplifyapp.com en AWS Amplify
 *
 * Cada origen (con "/" final) debe estar registrado en Entra ID,
 * en la plataforma "Aplicación de página única (SPA)".
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

export function MSALInstanceFactory():
  IPublicClientApplication {

  return new PublicClientApplication(
    msalConfig
  );
}

export function MSALGuardConfigFactory():
  MsalGuardConfiguration {

  return {
    interactionType:
      InteractionType.Redirect
  };
}

export function MSALInterceptorConfigFactory():
  MsalInterceptorConfiguration {

  const baseUrl = apiConfig.bffBaseUrl;

  const protectedResourceMap =
    new Map<string, Array<string>>();

  /**
   * Perfil del usuario autenticado.
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
   * API de consultas.
   *
   * La misma ruta puede recibir GET, POST y PUT,
   * por lo que solicitamos los permisos de
   * lectura y escritura.
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
   * API de catálogo.
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

  return {
    interactionType:
      InteractionType.Redirect,

    protectedResourceMap,

    strictMatching:
      true
  };
}