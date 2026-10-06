export type ConsultationStatus =
  | 'SOLICITADA'
  | 'CONFIRMADA'
  | 'EN_ESPERA'
  | 'EN_CONSULTA'
  | 'CERRADA'
  | 'CANCELADA';


export interface Consultation {

  id: number;

  petName: string;

  serviceName: string;

  requestedAt: string;

  status: ConsultationStatus;
}