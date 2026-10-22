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


  /**
   * Carga:
   *
   * - consultas
   * - prestaciones del catálogo
   *
   * El catálogo se utiliza para mostrar
   * el nombre de la prestación en vez
   * de solamente su ID.
   */
  protected loadInitialData(): void {

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
          this.sortConsultations(
            consultations
          )
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

        this.handleError(
          error
        );
      }
    });
  }


  /**
   * Carga las consultas aplicando
   * los filtros seleccionados.
   */
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
      .getConsultations(
        filter
      )
      .subscribe({

        next: (consultations) => {

          this.consultations.set(
            this.sortConsultations(
              consultations
            )
          );

          this.loading.set(false);
        },


        error: (
          error: HttpErrorResponse
        ) => {

          this.consultations.set([]);

          this.loading.set(false);

          this.handleError(
            error
          );
        }
      });
  }


  /**
   * Limpia todos los filtros.
   */
  protected clearFilters(): void {

    this.filterStatus = '';

    this.filterFrom = '';

    this.filterTo = '';

    this.loadConsultations();
  }


  /**
   * Busca el nombre de una prestación
   * utilizando su ID.
   */
  protected getServiceName(
    serviceId: number
  ): string {

    const service =
      this.catalogServices()
        .find(
          item =>
            item.id === serviceId
        );


    return (
      service?.name
      ?? `Prestación #${serviceId}`
    );
  }


  /**
   * Traduce el estado técnico a un
   * texto más amigable.
   */
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


  /**
   * Formatea fecha y hora para Chile.
   */
  protected formatDateTime(
    value: string
  ): string {

    const date =
      new Date(value);


    if (
      Number.isNaN(
        date.getTime()
      )
    ) {

      return value;
    }


    return new Intl.DateTimeFormat(
      'es-CL',
      {
        dateStyle:
          'medium',

        timeStyle:
          'short'
      }
    ).format(date);
  }


  /**
   * Ordena primero las consultas
   * más recientes.
   */
  private sortConsultations(
    consultations: Consultation[]
  ): Consultation[] {

    return [...consultations]
      .sort(
        (a, b) => {

          const firstDate =
            new Date(
              a.requestedAt
            ).getTime();

          const secondDate =
            new Date(
              b.requestedAt
            ).getTime();


          if (
            Number.isNaN(firstDate) ||
            Number.isNaN(secondDate)
          ) {

            return b.id - a.id;
          }


          return (
            secondDate -
            firstDate
          );
        }
      );
  }


  private handleError(
    error: HttpErrorResponse
  ): void {

    if (
      error.status === 401
    ) {

      this.errorMessage.set(
        'Tu sesión no posee una credencial válida. Inicia sesión nuevamente.'
      );

      return;
    }


    if (
      error.status === 403
    ) {

      this.errorMessage.set(
        'No tienes autorización para consultar esta información.'
      );

      return;
    }


    if (
      error.status === 503
    ) {

      this.errorMessage.set(
        'Uno de los servicios de VetCare no se encuentra disponible en este momento.'
      );

      return;
    }


    if (
      error.status === 0
    ) {

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