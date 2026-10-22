import {
  Injectable
} from '@angular/core';

import {
  HttpClient
} from '@angular/common/http';

import {
  Observable
} from 'rxjs';

import {
  apiConfig
} from '../config/api.config';

import {
  AuditEvent
} from '../models/audit-event.model';


@Injectable({
  providedIn: 'root'
})
export class AuditApiService {

  private readonly baseUrl =
    `${apiConfig.bffBaseUrl}/api/audit/events`;


  constructor(
    private readonly http: HttpClient
  ) {}


  /**
   * Obtiene todos los eventos de auditoría.
   *
   * Frontend
   * -> BFF
   * -> ms-vetcare-audit
   */
  getEvents():
    Observable<AuditEvent[]> {

    return this.http.get<AuditEvent[]>(
      this.baseUrl
    );
  }


  /**
   * Obtiene un evento de auditoría
   * específico por ID.
   */
  getEventById(
    id: number
  ): Observable<AuditEvent> {

    return this.http.get<AuditEvent>(
      `${this.baseUrl}/${id}`
    );
  }
}