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


  /**
   * Indica si el perfil cargado desde el BFF
   * corresponde a un usuario autenticado.
   */
  readonly isAuthenticated =
    computed(
      () =>
        this.currentUserSignal()
          ?.authenticated === true
    );


  /**
   * Roles VetCare recibidos desde:
   *
   * GET /api/security/me
   */
  readonly roles =
    computed<VetCareRole[]>(
      () =>
        this.currentUserSignal()
          ?.roles ?? []
    );


  /**
   * Rol principal mostrado en la interfaz.
   *
   * La autorización real NO depende de este valor.
   * Para permisos se utilizan hasRole() y
   * hasAnyRole().
   */
  readonly primaryRole =
    computed<VetCareRole | null>(() => {

      const roles =
        this.roles();

      const rolePriority:
        VetCareRole[] = [
          'Admin',
          'Operador',
          'Cliente',
          'Auditor'
        ];

      for (
        const role of rolePriority
      ) {

        if (
          roles.includes(role)
        ) {

          return role;
        }
      }

      return null;
    });


  /**
   * Perfil autenticado.
   *
   * LOCAL:
   * http://localhost:8084/api/security/me
   *
   * AWS:
   * API Gateway -> BFF -> /api/security/me
   */
  private readonly securityEndpoint =
    `${apiConfig.bffBaseUrl}/api/security/me`;


  constructor(
    private readonly http: HttpClient
  ) {}


  /**
   * Carga desde el BFF:
   *
   * - datos del usuario
   * - roles
   * - authorities
   */
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

          this.loadingSignal.set(
            false
          );
        }),


        catchError((error) => {

          this.currentUserSignal.set(
            null
          );

          this.loadingSignal.set(
            false
          );

          this.errorSignal.set(
            'No fue posible cargar la información del usuario.'
          );


          return throwError(
            () => error
          );
        })
      );
  }


  /**
   * Comprueba un rol específico.
   *
   * Ejemplo:
   *
   * hasRole('Admin')
   */
  hasRole(
    role: VetCareRole
  ): boolean {

    return this.roles()
      .includes(role);
  }


  /**
   * Comprueba si el usuario posee
   * al menos uno de los roles.
   *
   * Ejemplo:
   *
   * hasAnyRole(
   *   'Admin',
   *   'Operador'
   * )
   */
  hasAnyRole(
    ...roles: VetCareRole[]
  ): boolean {

    return roles.some(
      (role) =>
        this.hasRole(role)
    );
  }


  /**
   * Limpia el estado al cerrar sesión.
   */
  clearUser(): void {

    this.currentUserSignal.set(
      null
    );

    this.loadingSignal.set(
      false
    );

    this.errorSignal.set(
      null
    );
  }
}