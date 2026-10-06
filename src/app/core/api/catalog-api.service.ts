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
  CatalogService
} from '../models/catalog-service.model';


export interface CreateCatalogServiceRequest {
  name: string;
  price: number;
  availableSlots: number;
}


export interface UpdateCatalogServiceRequest {
  price: number;
  availableSlots: number;
}


@Injectable({
  providedIn: 'root'
})
export class CatalogApiService {

  private readonly baseUrl =
    `${apiConfig.bffBaseUrl}/api/catalog/services`;


  constructor(
    private readonly http: HttpClient
  ) {}


  getServices():
    Observable<CatalogService[]> {

    return this.http.get<CatalogService[]>(
      this.baseUrl
    );
  }


  createService(
    request: CreateCatalogServiceRequest
  ): Observable<CatalogService> {

    return this.http.post<CatalogService>(
      this.baseUrl,
      request
    );
  }


  updateService(
    id: number,
    request: UpdateCatalogServiceRequest
  ): Observable<CatalogService> {

    return this.http.put<CatalogService>(
      `${this.baseUrl}/${id}`,
      request
    );
  }
}