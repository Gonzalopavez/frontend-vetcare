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
  AuthStateService
} from '../../core/auth/auth-state.service';

import {
  ConsultationsApiService
} from '../../core/api/consultations-api.service';

import {
  Consultation,
  ConsultationStatus
} from '../../core/models/consultation.model';

import {
  ConsultationFilter
} from '../../core/models/consultation-filter.model';

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
      ConsultationsApiService
  ) {}

  ngOnInit(): void {

    this.loadConsultations();
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
        'El servicio de consultas veterinarias no se encuentra disponible en este momento.'
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
      'Ocurrió un error al cargar las consultas veterinarias.'
    );
  }
}