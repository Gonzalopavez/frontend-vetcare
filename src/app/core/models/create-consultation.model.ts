import {
  ConsultationStatus
} from './consultation.model';


export interface CreateConsultationRequest {

  petName: string;

  serviceId: number;

  requestedAt: string;

  observations: string;
}


export interface CreateConsultationResponse {

  id: number;

  petName: string;

  serviceId: number;

  requestedAt: string;

  status: ConsultationStatus;
}