import {
  ConsultationStatus
} from './consultation.model';


export interface ConsultationFilter {

  status?: ConsultationStatus;

  from?: string;

  to?: string;
}