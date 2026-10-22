import {
  inject
} from '@angular/core';

import {
  CanActivateFn,
  Router
} from '@angular/router';

import {
  catchError,
  map,
  of
} from 'rxjs';

import {
  AuthStateService
} from './auth-state.service';

import {
  VetCareRole
} from '../models/current-user.model';


export function roleGuard(
  ...allowedRoles: VetCareRole[]
): CanActivateFn {

  return () => {

    const authState =
      inject(AuthStateService);

    const router =
      inject(Router);


    /**
     * Comprueba si el usuario posee
     * alguno de los roles permitidos.
     */
    const evaluateAccess = () => {

      if (
        authState.hasAnyRole(
          ...allowedRoles
        )
      ) {

        return true;
      }


      return router.createUrlTree(
        [
          '/forbidden'
        ]
      );
    };


    /**
     * Si el perfil ya está cargado,
     * no necesitamos volver a consultar
     * el BFF.
     */
    if (
      authState.currentUser()
    ) {

      return evaluateAccess();
    }


    /**
     * Si el usuario recarga directamente
     * una ruta protegida, el CurrentUser
     * puede no existir todavía en memoria.
     *
     * En ese caso se obtiene nuevamente
     * desde:
     *
     * GET /api/security/me
     */
    return authState
      .loadCurrentUser()
      .pipe(

        map(
          () =>
            evaluateAccess()
        ),

        catchError(
          () =>
            of(
              router.createUrlTree(
                [
                  '/forbidden'
                ]
              )
            )
        )
      );
  };
}