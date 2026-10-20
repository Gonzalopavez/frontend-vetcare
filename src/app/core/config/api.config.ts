/**
 * URL base de la API de VetCare.
 *
 * - En desarrollo (localhost) el frontend llama directo al BFF local.
 * - En AWS (Amplify) el frontend debe llamar a AWS API Gateway, que es
 *   el único punto de entrada hacia el BFF.
 *
 * IMPORTANTE:
 * Reemplaza API_GATEWAY_URL por la "Invoke URL" de tu API Gateway.
 * - Sin barra final.
 * - Sin "/api" al final (las rutas ya lo incluyen).
 * - Si tu API Gateway usa un stage (por ejemplo /prod), inclúyelo:
 *   https://abc123.execute-api.us-east-1.amazonaws.com/prod
 */
const API_GATEWAY_URL =
  'https://REEMPLAZAR-ID.execute-api.REEMPLAZAR-REGION.amazonaws.com';

const LOCAL_BFF_URL = 'http://localhost:8084';

const isLocalhost =
  typeof window !== 'undefined' &&
  ['localhost', '127.0.0.1'].includes(window.location.hostname);

export const apiConfig = {
  bffBaseUrl: isLocalhost ? LOCAL_BFF_URL : API_GATEWAY_URL
} as const;