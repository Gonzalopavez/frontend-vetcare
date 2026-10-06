import {
  Component,
  OnInit,
  signal
} from '@angular/core';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  HttpErrorResponse
} from '@angular/common/http';

import {
  RouterLink
} from '@angular/router';

import {
  ConsultationsApiService
} from '../../core/api/consultations-api.service';

import {
  CatalogApiService
} from '../../core/api/catalog-api.service';

import {
  CatalogService
} from '../../core/models/catalog-service.model';

import {
  CreateConsultationRequest,
  CreateConsultationResponse
} from '../../core/models/create-consultation.model';


@Component({
  selector: 'app-consultation-create',

  imports: [
    ReactiveFormsModule,
    RouterLink
  ],

  templateUrl: './consultation-create.html',

  styleUrl: './consultation-create.scss'
})
export class ConsultationCreate implements OnInit {

  protected readonly catalogServices =
    signal<CatalogService[]>([]);

  protected readonly loadingCatalog =
    signal(false);

  protected readonly submitting =
    signal(false);

  protected readonly catalogError =
    signal<string | null>(null);

  protected readonly errorMessage =
    signal<string | null>(null);

  protected readonly createdConsultation =
    signal<CreateConsultationResponse | null>(null);


  protected readonly form;


  constructor(
    private readonly formBuilder:
      FormBuilder,

    private readonly consultationsApi:
      ConsultationsApiService,

    private readonly catalogApi:
      CatalogApiService
  ) {

    this.form =
      this.formBuilder.nonNullable.group({

        petName: [
          '',
          [
            Validators.required,
            Validators.minLength(2),
            Validators.maxLength(100)
          ]
        ],

        serviceId: [
          0,
          [
            Validators.required,
            Validators.min(1)
          ]
        ],

        requestedAt: [
          '',
          [
            Validators.required
          ]
        ],

        observations: [
          ''
        ]
      });
  }


  ngOnInit(): void {

    this.loadCatalog();
  }


  protected loadCatalog(): void {

    this.loadingCatalog.set(true);

    this.catalogError.set(null);

    this.catalogApi
      .getServices()
      .subscribe({

        next: (services) => {

          this.catalogServices.set(
            services
          );

          this.loadingCatalog.set(false);
        },

        error: (
          error: HttpErrorResponse
        ) => {

          this.catalogServices.set([]);

          this.loadingCatalog.set(false);

          this.handleCatalogError(
            error
          );
        }
      });
  }


  protected submit(): void {

    this.errorMessage.set(null);

    this.createdConsultation.set(null);

    if (this.form.invalid) {

      this.form.markAllAsTouched();

      return;
    }

    const rawValue =
      this.form.getRawValue();

    const request:
      CreateConsultationRequest = {

        petName:
          rawValue.petName.trim(),

        serviceId:
          Number(
            rawValue.serviceId
          ),

        requestedAt:
          this.normalizeDateTime(
            rawValue.requestedAt
          ),

        observations:
          rawValue.observations.trim()
      };

    this.submitting.set(true);

    this.consultationsApi
      .createConsultation(request)
      .subscribe({

        next: (response) => {

          this.submitting.set(false);

          this.createdConsultation.set(
            response
          );

          this.form.reset({

            petName: '',

            serviceId: 0,

            requestedAt: '',

            observations: ''
          });
        },

        error: (
          error: HttpErrorResponse
        ) => {

          this.submitting.set(false);

          this.handleCreateError(
            error
          );
        }
      });
  }


  protected hasError(
    controlName:
      'petName' |
      'serviceId' |
      'requestedAt'
  ): boolean {

    const control =
      this.form.controls[
        controlName
      ];

    return (
      control.invalid &&
      (
        control.touched ||
        control.dirty
      )
    );
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


  private normalizeDateTime(
    value: string
  ): string {

    if (
      value.length === 16
    ) {

      return `${value}:00`;
    }

    return value;
  }


  private handleCatalogError(
    error: HttpErrorResponse
  ): void {

    if (error.status === 401) {

      this.catalogError.set(
        'Tu sesión no posee una credencial válida.'
      );

      return;
    }

    if (error.status === 403) {

      this.catalogError.set(
        'No tienes autorización para consultar las prestaciones veterinarias.'
      );

      return;
    }

    if (error.status === 503) {

      this.catalogError.set(
        'El servicio de catálogo no se encuentra disponible en este momento.'
      );

      return;
    }

    if (error.status === 0) {

      this.catalogError.set(
        'No fue posible establecer conexión con VetCare.'
      );

      return;
    }

    this.catalogError.set(
      'No fue posible cargar las prestaciones veterinarias.'
    );
  }


  private handleCreateError(
    error: HttpErrorResponse
  ): void {

    if (error.status === 400) {

      this.errorMessage.set(
        'Los datos ingresados no son válidos. Revisa el formulario.'
      );

      return;
    }

    if (error.status === 401) {

      this.errorMessage.set(
        'Tu sesión no posee una credencial válida. Inicia sesión nuevamente.'
      );

      return;
    }

    if (error.status === 403) {

      this.errorMessage.set(
        'No tienes autorización para crear consultas veterinarias.'
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
      'Ocurrió un error al crear la consulta veterinaria.'
    );
  }
}