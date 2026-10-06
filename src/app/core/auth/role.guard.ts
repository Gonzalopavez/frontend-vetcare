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


    /*
     * Si el perfil VetCare ya fue cargado,
     * podemos evaluar inmediatamente.
     */
    if (
      authState.currentUser()
    ) {

      return evaluateAccess();
    }


    /*
     * Si el usuario recargó directamente una URL
     * protegida, Angular puede no tener todavía
     * el CurrentUser en memoria.
     *
     * En ese caso consultamos nuevamente al BFF.
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