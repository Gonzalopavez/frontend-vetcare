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


export const msalConfig: Configuration = {

  auth: {

    clientId:
      '76587cb6-60bd-4fd9-afa5-1727ffb6b570',

    authority:
      'https://login.microsoftonline.com/b5cc8e1d-1dbb-4b10-bbf5-da56c099e228',

    redirectUri:
      'http://localhost:4200/',

    postLogoutRedirectUri:
      'http://localhost:4200/'
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

  const protectedResourceMap =
    new Map<string, Array<string>>();


  /*
   * Perfil del usuario autenticado.
   */
  protectedResourceMap.set(
    'http://localhost:8084/api/security/me',

    [
      vetCareApiScopes.consultasLeer,
      vetCareApiScopes.consultasEscribir,
      vetCareApiScopes.catalogoLeer,
      vetCareApiScopes.catalogoEscribir
    ]
  );


  /*
   * API de consultas.
   *
   * La misma ruta puede recibir GET, POST y PUT,
   * por lo que solicitamos los permisos de
   * lectura y escritura.
   */
  protectedResourceMap.set(
    'http://localhost:8084/api/consultations',

    [
      vetCareApiScopes.consultasLeer,
      vetCareApiScopes.consultasEscribir
    ]
  );

  protectedResourceMap.set(
    'http://localhost:8084/api/consultations/*',

    [
      vetCareApiScopes.consultasLeer,
      vetCareApiScopes.consultasEscribir
    ]
  );


  /*
   * API de catálogo.
   */
  protectedResourceMap.set(
    'http://localhost:8084/api/catalog/services',

    [
      vetCareApiScopes.catalogoLeer,
      vetCareApiScopes.catalogoEscribir
    ]
  );

  protectedResourceMap.set(
    'http://localhost:8084/api/catalog/services/*',

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