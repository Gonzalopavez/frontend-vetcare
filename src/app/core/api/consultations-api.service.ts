import {
  Injectable
} from '@angular/core';

import {
  HttpClient,
  HttpParams
} from '@angular/common/http';

import {
  Observable
} from 'rxjs';

import {
  apiConfig
} from '../config/api.config';

import {
  Consultation
} from '../models/consultation.model';

import {
  ConsultationFilter
} from '../models/consultation-filter.model';

import {
  CreateConsultationRequest,
  CreateConsultationResponse
} from '../models/create-consultation.model';

import {
  UpdateConsultationStatusRequest
} from '../models/update-consultation-status.model';


@Injectable({
  providedIn: 'root'
})
export class ConsultationsApiService {

  /**
   * Todas las llamadas pasan por el BFF.
   *
   * Local:
   * http://localhost:8084/api/consultations
   *
   * AWS:
   * API Gateway -> BFF -> Consultations
   */
  private readonly baseUrl =
    `${apiConfig.bffBaseUrl}/api/consultations`;


  constructor(
    private readonly http: HttpClient
  ) {}


  /**
   * Lista las consultas.
   *
   * Los filtros son opcionales:
   * - status
   * - from
   * - to
   */
  getConsultations(
    filter: ConsultationFilter = {}
  ): Observable<Consultation[]> {

    let params =
      new HttpParams();

    if (filter.status) {

      params =
        params.set(
          'status',
          filter.status
        );
    }

    if (filter.from) {

      params =
        params.set(
          'from',
          filter.from
        );
    }

    if (filter.to) {

      params =
        params.set(
          'to',
          filter.to
        );
    }

    return this.http.get<Consultation[]>(
      this.baseUrl,
      {
        params
      }
    );
  }


  /**
   * Obtiene una consulta específica.
   */
  getConsultationById(
    id: number
  ): Observable<Consultation> {

    return this.http.get<Consultation>(
      `${this.baseUrl}/${id}`
    );
  }


  /**
   * Crea una nueva consulta.
   */
  createConsultation(
    request: CreateConsultationRequest
  ): Observable<CreateConsultationResponse> {

    return this.http.post<CreateConsultationResponse>(
      this.baseUrl,
      request
    );
  }


  /**
   * Cambia el estado de una consulta.
   *
   * Ejemplo:
   *
   * PUT /api/consultations/2/status
   *
   * Body:
   * {
   *   "status": "CONFIRMADA"
   * }
   */
  updateStatus(
    id: number,
    request: UpdateConsultationStatusRequest
  ): Observable<Consultation> {

    return this.http.put<Consultation>(
      `${this.baseUrl}/${id}/status`,
      request
    );
  }

}