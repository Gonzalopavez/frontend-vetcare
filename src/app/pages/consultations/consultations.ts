import {
  Component,
  OnInit,
  signal
} from '@angular/core';

import {
  FormsModule
} from '@angular/forms';

import {
  HttpErrorResponse
} from '@angular/common/http';

import {
  forkJoin
} from 'rxjs';

import {
  AuthStateService
} from '../../core/auth/auth-state.service';

import {
  ConsultationsApiService
} from '../../core/api/consultations-api.service';

import {
  CatalogApiService
} from '../../core/api/catalog-api.service';

import {
  Consultation,
  ConsultationStatus
} from '../../core/models/consultation.model';

import {
  ConsultationFilter
} from '../../core/models/consultation-filter.model';

import {
  CatalogService
} from '../../core/models/catalog-service.model';


@Component({
  selector: 'app-consultations',

  imports: [
    FormsModule
  ],

  templateUrl: './consultations.html',

  styleUrl: './consultations.scss'
})
export class Consultations implements OnInit {

  protected readonly consultations =
    signal<Consultation[]>([]);

  protected readonly catalogServices =
    signal<CatalogService[]>([]);

  protected readonly loading =
    signal(false);

  protected readonly errorMessage =
    signal<string | null>(null);

  protected filterStatus:
    ConsultationStatus | '' = '';

  protected filterFrom = '';

  protected filterTo = '';

  protected readonly availableStatuses:
    ConsultationStatus[] = [
      'SOLICITADA',
      'CONFIRMADA',
      'EN_ESPERA',
      'EN_CONSULTA',
      'CERRADA',
      'CANCELADA'
    ];


  constructor(
    protected readonly authState:
      AuthStateService,

    private readonly consultationsApi:
      ConsultationsApiService,

    private readonly catalogApi:
      CatalogApiService
  ) {}


  ngOnInit(): void {

    this.loadInitialData();
  }


  private loadInitialData(): void {

    this.loading.set(true);

    this.errorMessage.set(null);

    forkJoin({

      consultations:
        this.consultationsApi
          .getConsultations(),

      services:
        this.catalogApi
          .getServices()

    }).subscribe({

      next: ({
        consultations,
        services
      }) => {

        this.consultations.set(
          consultations
        );

        this.catalogServices.set(
          services
        );

        this.loading.set(false);
      },

      error: (
        error: HttpErrorResponse
      ) => {

        this.consultations.set([]);

        this.catalogServices.set([]);

        this.loading.set(false);

        this.handleError(error);
      }
    });
  }


  protected loadConsultations(): void {

    const filter:
      ConsultationFilter = {};

    if (this.filterStatus) {

      filter.status =
        this.filterStatus;
    }

    if (this.filterFrom) {

      filter.from =
        this.filterFrom;
    }

    if (this.filterTo) {

      filter.to =
        this.filterTo;
    }

    this.loading.set(true);

    this.errorMessage.set(null);

    this.consultationsApi
      .getConsultations(filter)
      .subscribe({

        next: (consultations) => {

          this.consultations.set(
            consultations
          );

          this.loading.set(false);
        },

        error: (
          error: HttpErrorResponse
        ) => {

          this.consultations.set([]);

          this.loading.set(false);

          this.handleError(error);
        }
      });
  }


  protected clearFilters(): void {

    this.filterStatus = '';

    this.filterFrom = '';

    this.filterTo = '';

    this.loadConsultations();
  }


  protected getServiceName(
    serviceId: number
  ): string {

    const service =
      this.catalogServices()
        .find(
          item =>
            item.id === serviceId
        );

    return service?.name
      ?? `Prestación #${serviceId}`;
  }


  protected formatStatus(
    status: ConsultationStatus
  ): string {

    const labels:
      Record<ConsultationStatus, string> = {

        SOLICITADA:
          'Solicitada',

        CONFIRMADA:
          'Confirmada',

        EN_ESPERA:
          'En espera',

        EN_CONSULTA:
          'En consulta',

        CERRADA:
          'Cerrada',

        CANCELADA:
          'Cancelada'
      };

    return labels[status];
  }


  private handleError(
    error: HttpErrorResponse
  ): void {

    if (error.status === 401) {

      this.errorMessage.set(
        'Tu sesión no posee una credencial válida. Inicia sesión nuevamente.'
      );

      return;
    }

    if (error.status === 403) {

      this.errorMessage.set(
        'No tienes autorización para consultar esta información.'
      );

      return;
    }

    if (error.status === 503) {

      this.errorMessage.set(
        'Uno de los servicios de VetCare no se encuentra disponible en este momento.'
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
      'Ocurrió un error al cargar la información de las consultas.'
    );
  }
}