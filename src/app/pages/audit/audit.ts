import {
  Component,
  OnInit,
  signal
} from '@angular/core';

import {
  HttpErrorResponse
} from '@angular/common/http';

import {
  AuditApiService
} from '../../core/api/audit-api.service';

import {
  AuditEvent
} from '../../core/models/audit-event.model';


@Component({
  selector: 'app-audit',

  imports: [],

  templateUrl: './audit.html',

  styleUrl: './audit.scss'
})
export class Audit implements OnInit {

  protected readonly events =
    signal<AuditEvent[]>([]);

  protected readonly loading =
    signal(false);

  protected readonly errorMessage =
    signal<string | null>(null);


  constructor(
    private readonly auditApi:
      AuditApiService
  ) {}


  ngOnInit(): void {

    this.loadEvents();
  }


  /**
   * Carga los eventos almacenados
   * por ms-vetcare-audit.
   */
  protected loadEvents(): void {

    this.loading.set(true);

    this.errorMessage.set(null);


    this.auditApi
      .getEvents()
      .subscribe({

        next: (events) => {

          /*
           * Mostramos primero los eventos
           * más recientes.
           */
          const sortedEvents =
            [...events]
              .sort(
                (a, b) =>
                  b.id - a.id
              );

          this.events.set(
            sortedEvents
          );

          this.loading.set(false);
        },


        error: (
          error: HttpErrorResponse
        ) => {

          this.events.set([]);

          this.loading.set(false);

          this.handleLoadError(
            error
          );
        }
      });
  }


  /**
   * Obtiene la routing key sin importar
   * si Audit responde camelCase o snake_case.
   */
  protected getRoutingKey(
    event: AuditEvent
  ): string {

    return (
      event.routingKey
      ?? event.routing_key
      ?? 'Evento desconocido'
    );
  }


  /**
   * Obtiene la fecha del evento.
   */
  protected getReceivedAt(
    event: AuditEvent
  ): string {

    return (
      event.receivedAt
      ?? event.received_at
      ?? ''
    );
  }


  /**
   * Traduce las routing keys para mostrar
   * algo más entendible en pantalla.
   */
  protected formatEventType(
    event: AuditEvent
  ): string {

    const routingKey =
      this.getRoutingKey(event);


    const labels:
      Record<string, string> = {

        'catalog.service.created':
          'Prestación creada',

        'catalog.service.updated':
          'Prestación modificada',

        'catalog.service.deleted':
          'Prestación eliminada',

        'consultation.created':
          'Consulta creada',

        'consultation.status.changed':
          'Estado de consulta modificado'
      };


    return (
      labels[routingKey]
      ?? routingKey
    );
  }


  /**
   * Formatea la fecha para Chile.
   */
  protected formatDateTime(
    value: string
  ): string {

    if (!value) {

      return 'Sin fecha';
    }


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
   * Intenta mostrar el JSON del evento
   * de forma legible.
   */
  protected formatPayload(
    payload: string
  ): string {

    if (!payload) {

      return 'Sin información';
    }


    try {

      const parsed =
        JSON.parse(payload);

      return JSON.stringify(
        parsed,
        null,
        2
      );

    } catch {

      return payload;
    }
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
        'No tienes autorización para consultar la auditoría.'
      );

      return;
    }


    if (error.status === 503) {

      this.errorMessage.set(
        'El servicio de auditoría no se encuentra disponible.'
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
      'Ocurrió un error al cargar los eventos de auditoría.'
    );
  }
}