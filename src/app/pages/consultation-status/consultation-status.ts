import {
  Component,
  OnInit,
  signal
} from '@angular/core';

import {
  HttpErrorResponse
} from '@angular/common/http';

import {
  forkJoin
} from 'rxjs';

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
  CatalogService
} from '../../core/models/catalog-service.model';


@Component({
  selector: 'app-consultation-status',

  imports: [],

  templateUrl: './consultation-status.html',

  styleUrl: './consultation-status.scss'
})
export class ConsultationStatusPage implements OnInit {

  protected readonly consultations =
    signal<Consultation[]>([]);

  protected readonly catalogServices =
    signal<CatalogService[]>([]);

  protected readonly loading =
    signal(false);

  protected readonly errorMessage =
    signal<string | null>(null);

  protected readonly successMessage =
    signal<string | null>(null);

  protected readonly updatingId =
    signal<number | null>(null);


  constructor(
    private readonly consultationsApi:
      ConsultationsApiService,

    private readonly catalogApi:
      CatalogApiService
  ) {}


  ngOnInit(): void {

    this.loadData();
  }


  protected loadData(): void {

    this.loading.set(true);

    this.errorMessage.set(null);

    this.successMessage.set(null);

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

        this.handleLoadError(error);
      }
    });
  }


  protected getValidNextStatuses(
    currentStatus: ConsultationStatus
  ): ConsultationStatus[] {

    switch (currentStatus) {

      case 'SOLICITADA':

        return [
          'CONFIRMADA',
          'CANCELADA'
        ];


      case 'CONFIRMADA':

        return [
          'EN_ESPERA',
          'CANCELADA'
        ];


      case 'EN_ESPERA':

        return [
          'EN_CONSULTA',
          'CANCELADA'
        ];


      case 'EN_CONSULTA':

        return [
          'CERRADA'
        ];


      case 'CERRADA':
      case 'CANCELADA':

        return [];
    }
  }


  protected updateStatus(
    consultation: Consultation,
    newStatusValue: string
  ): void {

    if (!newStatusValue) {

      return;
    }

    const newStatus =
      newStatusValue as ConsultationStatus;

    this.errorMessage.set(null);

    this.successMessage.set(null);

    this.updatingId.set(
      consultation.id
    );

    this.consultationsApi
      .updateStatus(
        consultation.id,
        {
          status: newStatus
        }
      )
      .subscribe({

        next: (updatedConsultation) => {

          this.consultations.update(
            currentConsultations =>
              currentConsultations.map(
                item =>
                  item.id === updatedConsultation.id
                    ? updatedConsultation
                    : item
              )
          );

          this.updatingId.set(null);

          this.successMessage.set(
            `La consulta #${updatedConsultation.id} cambió correctamente a ${this.formatStatus(updatedConsultation.status)}.`
          );
        },

        error: (
          error: HttpErrorResponse
        ) => {

          this.updatingId.set(null);

          this.handleUpdateError(
            error
          );
        }
      });
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
        dateStyle: 'medium',
        timeStyle: 'short'
      }
    ).format(date);
  }


  protected isFinalStatus(
    status: ConsultationStatus
  ): boolean {

    return (
      status === 'CERRADA' ||
      status === 'CANCELADA'
    );
  }


  private handleLoadError(
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
        'No tienes autorización para gestionar consultas veterinarias.'
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
      'Ocurrió un error al cargar las consultas.'
    );
  }


  private handleUpdateError(
    error: HttpErrorResponse
  ): void {

    if (error.status === 400) {

      this.errorMessage.set(
        'El estado solicitado no es válido.'
      );

      return;
    }

    if (error.status === 401) {

      this.errorMessage.set(
        'Tu sesión no posee una credencial válida.'
      );

      return;
    }

    if (error.status === 403) {

      this.errorMessage.set(
        'No tienes autorización para cambiar el estado de esta consulta.'
      );

      return;
    }

    if (error.status === 404) {

      this.errorMessage.set(
        'La consulta que intentas modificar no existe.'
      );

      return;
    }

    if (error.status === 409) {

      this.errorMessage.set(
        'La transición de estado solicitada no está permitida.'
      );

      return;
    }

    if (error.status === 503) {

      this.errorMessage.set(
        'El servicio de consultas veterinarias no se encuentra disponible.'
      );

      return;
    }

    this.errorMessage.set(
      'Ocurrió un error al actualizar el estado de la consulta.'
    );
  }
}