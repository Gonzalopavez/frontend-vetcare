import {
  Component,
  OnInit,
  inject,
  signal
} from '@angular/core';

import {
  ReactiveFormsModule,
  FormBuilder,
  Validators
} from '@angular/forms';

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
  selector: 'app-admin-catalog',

  imports: [
    ReactiveFormsModule
  ],

  templateUrl: './admin-catalog.html',

  styleUrl: './admin-catalog.scss'
})
export class AdminCatalog implements OnInit {

  private readonly formBuilder =
    inject(FormBuilder);

  private readonly catalogApi =
    inject(CatalogApiService);


  protected readonly services =
    signal<CatalogService[]>([]);

  protected readonly loading =
    signal(false);

  protected readonly creating =
    signal(false);

  protected readonly updating =
    signal(false);

  protected readonly selectedService =
    signal<CatalogService | null>(null);

  protected readonly errorMessage =
    signal<string | null>(null);

  protected readonly successMessage =
    signal<string | null>(null);


  protected readonly createForm;

  protected readonly editForm;


  constructor() {

    this.createForm =
      this.formBuilder.nonNullable.group({

        name: [
          '',
          [
            Validators.required
          ]
        ],

        price: [
          0,
          [
            Validators.required,
            Validators.min(0)
          ]
        ],

        availableSlots: [
          0,
          [
            Validators.required,
            Validators.min(0)
          ]
        ]
      });


    this.editForm =
      this.formBuilder.nonNullable.group({

        price: [
          0,
          [
            Validators.required,
            Validators.min(0)
          ]
        ],

        availableSlots: [
          0,
          [
            Validators.required,
            Validators.min(0)
          ]
        ]
      });
  }


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

          this.handleError(
            error,
            'No fue posible cargar el catálogo.'
          );
        }
      });
  }


  protected createService(): void {

    this.errorMessage.set(null);

    this.successMessage.set(null);

    if (this.createForm.invalid) {

      this.createForm.markAllAsTouched();

      return;
    }

    const value =
      this.createForm.getRawValue();

    this.creating.set(true);

    this.catalogApi
      .createService({

        name:
          value.name.trim(),

        price:
          Number(value.price),

        availableSlots:
          Number(value.availableSlots)
      })
      .subscribe({

        next: (createdService) => {

          this.services.update(
            current => [
              ...current,
              createdService
            ]
          );

          this.createForm.reset({

            name: '',

            price: 0,

            availableSlots: 0
          });

          this.creating.set(false);

          this.successMessage.set(
            `La prestación "${createdService.name}" fue creada correctamente.`
          );
        },

        error: (
          error: HttpErrorResponse
        ) => {

          this.creating.set(false);

          this.handleError(
            error,
            'No fue posible crear la prestación.'
          );
        }
      });
  }


  protected selectService(
    service: CatalogService
  ): void {

    this.selectedService.set(
      service
    );

    this.errorMessage.set(null);

    this.successMessage.set(null);

    this.editForm.setValue({

      price:
        service.price,

      availableSlots:
        service.availableSlots
    });
  }


  protected cancelEdit(): void {

    this.selectedService.set(null);

    this.editForm.reset({

      price: 0,

      availableSlots: 0
    });
  }


  protected updateService(): void {

    const service =
      this.selectedService();

    if (!service) {

      return;
    }

    this.errorMessage.set(null);

    this.successMessage.set(null);

    if (this.editForm.invalid) {

      this.editForm.markAllAsTouched();

      return;
    }

    const value =
      this.editForm.getRawValue();

    this.updating.set(true);

    this.catalogApi
      .updateService(
        service.id,
        {

          price:
            Number(value.price),

          availableSlots:
            Number(value.availableSlots)
        }
      )
      .subscribe({

        next: (updatedService) => {

          this.services.update(
            current =>
              current.map(
                item =>
                  item.id === updatedService.id
                    ? updatedService
                    : item
              )
          );

          this.selectedService.set(null);

          this.updating.set(false);

          this.successMessage.set(
            `La prestación "${updatedService.name}" fue actualizada correctamente.`
          );
        },

        error: (
          error: HttpErrorResponse
        ) => {

          this.updating.set(false);

          this.handleError(
            error,
            'No fue posible actualizar la prestación.'
          );
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


  protected createFieldInvalid(
    field:
      'name' |
      'price' |
      'availableSlots'
  ): boolean {

    const control =
      this.createForm.controls[field];

    return (
      control.invalid &&
      (
        control.touched ||
        control.dirty
      )
    );
  }


  protected editFieldInvalid(
    field:
      'price' |
      'availableSlots'
  ): boolean {

    const control =
      this.editForm.controls[field];

    return (
      control.invalid &&
      (
        control.touched ||
        control.dirty
      )
    );
  }


  private handleError(
    error: HttpErrorResponse,
    fallbackMessage: string
  ): void {

    if (error.status === 400) {

      this.errorMessage.set(
        'Los datos ingresados no son válidos.'
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
        'No tienes autorización para administrar el catálogo.'
      );

      return;
    }

    if (error.status === 404) {

      this.errorMessage.set(
        'La prestación solicitada no existe.'
      );

      return;
    }

    if (error.status === 503) {

      this.errorMessage.set(
        'El servicio de catálogo no se encuentra disponible.'
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
      fallbackMessage
    );
  }
}