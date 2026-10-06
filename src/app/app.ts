import {
  Component,
  OnInit,
  signal
} from '@angular/core';

import {
  RouterLink,
  RouterLinkActive,
  RouterOutlet
} from '@angular/router';

import {
  MsalService
} from '@azure/msal-angular';

import {
  vetCareApiScopes
} from './auth-config';

import {
  AuthStateService
} from './core/auth/auth-state.service';

@Component({
  selector: 'app-root',

  imports: [
    RouterLink,
    RouterLinkActive,
    RouterOutlet
  ],

  templateUrl: './app.html',

  styleUrl: './app.scss'
})
export class App implements OnInit {

  protected readonly title =
    signal('VetCare');

  protected readonly isLoggedIn =
    signal(false);

  protected readonly accountName =
    signal('');

  constructor(
    private readonly authService: MsalService,

    protected readonly authState: AuthStateService
  ) {}

  ngOnInit(): void {

    this.authService
      .handleRedirectObservable()
      .subscribe({

        next: (result) => {

          if (result?.account) {

            this.authService.instance
              .setActiveAccount(
                result.account
              );
          }

          this.updateLoginState();
        },

        error: (error) => {

          console.error(
            'Error al procesar el redirect de MSAL:',
            error
          );
        }
      });
  }

  login(): void {

    this.authService
      .loginRedirect()
      .subscribe({

        error: (error) => {

          console.error(
            'Error durante el inicio de sesión:',
            error
          );
        }
      });
  }

  logout(): void {

    this.authState.clearUser();

    this.authService
      .logoutRedirect()
      .subscribe({

        error: (error) => {

          console.error(
            'Error durante el cierre de sesión:',
            error
          );
        }
      });
  }

  obtenerAccessToken(): void {

    const account =
      this.authService.instance
        .getActiveAccount();

    if (!account) {

      console.error(
        'No existe una cuenta activa para solicitar el Access Token.'
      );

      return;
    }

    const scopes = [
      vetCareApiScopes.consultasLeer,
      vetCareApiScopes.consultasEscribir,
      vetCareApiScopes.catalogoLeer,
      vetCareApiScopes.catalogoEscribir
    ];

    this.authService
      .acquireTokenSilent({
        account,
        scopes
      })
      .subscribe({

        next: (result) => {

          console.log(
            'Access Token de VetCare-API obtenido correctamente.'
          );

          const claims =
            this.decodeJwtPayload(
              result.accessToken
            );

          console.log(
            'Claims del Access Token:',
            claims
          );
        },

        error: (error) => {

          console.error(
            'No fue posible obtener el Access Token silenciosamente:',
            error
          );
        }
      });
  }

  private updateLoginState(): void {

    let account =
      this.authService.instance
        .getActiveAccount();

    if (!account) {

      const accounts =
        this.authService.instance
          .getAllAccounts();

      if (accounts.length > 0) {

        account = accounts[0];

        this.authService.instance
          .setActiveAccount(
            account
          );
      }
    }

    if (account) {

      this.isLoggedIn.set(true);

      this.accountName.set(
        account.name ??
        account.username ??
        'Usuario autenticado'
      );

      console.log(
        'Cuenta activa de VetCare:',
        account
      );

      console.log(
        'Claims del ID Token:',
        account.idTokenClaims
      );

      this.loadVetCareUser();

    } else {

      this.isLoggedIn.set(false);

      this.accountName.set('');

      this.authState.clearUser();
    }
  }

  private loadVetCareUser(): void {

    if (
      this.authState.currentUser() ||
      this.authState.loading()
    ) {
      return;
    }

    this.authState
      .loadCurrentUser()
      .subscribe({

        next: (user) => {

          console.log(
            'Perfil VetCare cargado correctamente:',
            user
          );

          console.log(
            'Roles VetCare:',
            user.roles
          );

          console.log(
            'Authorities VetCare:',
            user.authorities
          );
        },

        error: (error) => {

          console.error(
            'No fue posible cargar el perfil VetCare:',
            error
          );
        }
      });
  }

  private decodeJwtPayload(
    token: string
  ): Record<string, unknown> {

    const payload =
      token.split('.')[1];

    if (!payload) {

      throw new Error(
        'El Access Token no contiene un payload JWT válido.'
      );
    }

    let normalizedPayload =
      payload
        .replace(/-/g, '+')
        .replace(/_/g, '/');

    while (
      normalizedPayload.length % 4 !== 0
    ) {
      normalizedPayload += '=';
    }

    const decodedPayload =
      decodeURIComponent(
        atob(normalizedPayload)
          .split('')
          .map(
            (char) =>
              '%' +
              char
                .charCodeAt(0)
                .toString(16)
                .padStart(2, '0')
          )
          .join('')
      );

    return JSON.parse(
      decodedPayload
    ) as Record<string, unknown>;
  }
}