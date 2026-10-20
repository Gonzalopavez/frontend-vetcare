import {
  computed,
  Injectable,
  signal
} from '@angular/core';

import {
  HttpClient
} from '@angular/common/http';

import {
  catchError,
  Observable,
  tap,
  throwError
} from 'rxjs';

import {
  apiConfig
} from '../config/api.config';

import {
  CurrentUser,
  VetCareRole
} from '../models/current-user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthStateService {

  private readonly currentUserSignal =
    signal<CurrentUser | null>(null);

  private readonly loadingSignal =
    signal(false);

  private readonly errorSignal =
    signal<string | null>(null);

  readonly currentUser =
    this.currentUserSignal.asReadonly();

  readonly loading =
    this.loadingSignal.asReadonly();

  readonly error =
    this.errorSignal.asReadonly();

  readonly isAuthenticated =
    computed(
      () =>
        this.currentUserSignal()
          ?.authenticated === true
    );

  readonly roles =
    computed(
      () =>
        this.currentUserSignal()
          ?.roles ?? []
    );

  readonly primaryRole =
    computed<VetCareRole | null>(() => {

      const roles =
        this.currentUserSignal()
          ?.roles ?? [];

      return roles.length > 0
        ? roles[0]
        : null;
    });

  /**
   * Endpoint del perfil autenticado.
   * Usa la misma URL base que el resto de la API
   * (BFF local o API Gateway en AWS).
   */
  private readonly securityEndpoint =
    `${apiConfig.bffBaseUrl}/api/security/me`;

  constructor(
    private readonly http: HttpClient
  ) {}

  loadCurrentUser():
    Observable<CurrentUser> {

    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http
      .get<CurrentUser>(
        this.securityEndpoint
      )
      .pipe(

        tap((user) => {

          this.currentUserSignal.set(
            user
          );

          this.loadingSignal.set(false);
        }),

        catchError((error) => {

          this.currentUserSignal.set(
            null
          );

          this.loadingSignal.set(false);

          this.errorSignal.set(
            'No fue posible cargar la información del usuario.'
          );

          return throwError(
            () => error
          );
        })
      );
  }

  hasRole(
    role: VetCareRole
  ): boolean {

    return this.roles()
      .includes(role);
  }

  hasAnyRole(
    ...roles: VetCareRole[]
  ): boolean {

    return roles.some(
      (role) =>
        this.hasRole(role)
    );
  }

  clearUser(): void {

    this.currentUserSignal.set(null);
    this.loadingSignal.set(false);
    this.errorSignal.set(null);
  }

}