import {
  Component,
  OnInit,
  signal
} from '@angular/core';

import {
  HttpErrorResponse
} from '@angular/common/http';

import {
  CatalogApiService
} from '../../core/api/catalog-api.service';

import {
  CatalogService
} from '../../core/models/catalog-service.model';


@Component({
  selector: 'app-catalog',

  imports: [],

  templateUrl: './catalog.html',

  styleUrl: './catalog.scss'
})
export class Catalog implements OnInit {

  protected readonly services =
    signal<CatalogService[]>([]);

  protected readonly loading =
    signal(false);

  protected readonly errorMessage =
    signal<string | null>(null);


  constructor(
    private readonly catalogApi:
      CatalogApiService
  ) {}


  ngOnInit(): void {

    this.loadServices();
  }


  protected loadServices(): void {

    this.loading.set(true);

    this.errorMessage.set(null);

    this.catalogApi
      .getServices()
      .subscribe({

        next: (services) => {

          this.services.set(
            services
          );

          this.loading.set(false);
        },

        error: (
          error: HttpErrorResponse
        ) => {

          this.services.set([]);

          this.loading.set(false);

          this.handleError(error);
        }
      });
  }


  protected formatPrice(
    price: number
  ): string {

    return new Intl.NumberFormat(
      'es-CL',
      {
        style: 'currency',
        currency: 'CLP',
        maximumFractionDigits: 0
      }
    ).format(price);
  }


  private handleError(
    error: HttpErrorResponse
  ): void {

    if (error.status === 401) {

      this.errorMessage.set(
        'Tu sesión no posee una credencial válida.'
      );

      return;
    }

    if (error.status === 403) {

      this.errorMessage.set(
        'No tienes autorización para consultar el catálogo.'
      );

      return;
    }

    if (error.status === 503) {

      this.errorMessage.set(
        'El servicio de catálogo no se encuentra disponible en este momento.'
      );

      return;
    }

    if (error.status === 0) {

      this.errorMessage.set(
        'No fue posible establecer conexión con VetCare.'
      );

      return;
    }

    this.errorMessage.set(
      'Ocurrió un error al cargar el catálogo.'
    );
  }
}