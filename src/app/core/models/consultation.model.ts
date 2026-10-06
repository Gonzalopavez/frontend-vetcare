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
  serviceId: number;
  requestedAt: string;
  observations: string | null;
  status: ConsultationStatus;
}