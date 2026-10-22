export interface AuditEvent {

  id: number;

  /*
   * Dejamos compatibilidad con ambos nombres
   * por si el backend serializa camelCase
   * o snake_case.
   */
  routingKey?: string;

  routing_key?: string;

  payload: string;

  receivedAt?: string;

  received_at?: string;
}