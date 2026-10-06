export type VetCareRole =
  | 'Admin'
  | 'Operador'
  | 'Cliente'
  | 'Auditor';

export interface CurrentUser {

  authenticated: boolean;

  principal: string;

  oid: string;

  tid: string;

  name: string | null;

  preferred_username: string | null;

  aud: string[];

  iss: string;

  scp: string | null;

  roles: VetCareRole[];

  expiresAt: string | null;

  authorities: string[];
}