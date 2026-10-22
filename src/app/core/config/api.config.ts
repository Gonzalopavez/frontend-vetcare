/**
 * URL base de la API de VetCare.
 *
 * LOCAL:
 * Angular -> BFF local
 *
 * AWS:
 * Angular -> API Gateway -> BFF
 */

const API_GATEWAY_URL =
  'https://6wn7p8o7ml.execute-api.us-east-1.amazonaws.com';

const LOCAL_BFF_URL =
  'http://localhost:8084';

const isLocalhost =
  typeof window !== 'undefined' &&
  [
    'localhost',
    '127.0.0.1'
  ].includes(window.location.hostname);

export const apiConfig = {

  bffBaseUrl:
    isLocalhost
      ? LOCAL_BFF_URL
      : API_GATEWAY_URL

} as const;