// Cliente Uanataca API de Flujos 2 V1.0 (multi-empresa)
// Docs:
//   POST {host}/v2/flows  -> crea flujo de firma (OneShot)
//   Headers auth: x-api-key (clientId) + x-api-secret (clientSecret)
//
// El flujo migrado reemplaza al anterior wrapper Nexxit.

import { UANATACA_EMPRESAS } from './uanataca.templates';

const HOST = process.env.NEXT_PUBLIC_UANATACA_HOST;
const WEBHOOK_URL = process.env.NEXT_PUBLIC_UANATACA_WEBHOOK_URL;
// Prefijo legacy que se guarda en la columna SSO de la BD (mismo patron que
// se usaba con Nexxit: `<SSO_PREFIX>/<flowId>`).
const SSO_PREFIX =
  process.env.NEXT_PUBLIC_UANATACA_SSO_PREFIX ||
  'https://hypertronics.nexxit.dev/#sso//api/uanataca/v2/flows';
// Pasarela de firma (el usuario abre este link para firmar con token).
// Sandbox: https://pasarelafirma-sandbox.uanatacaec.com
// Prod:    https://pasarelafirma.uanatacaec.com
const SIGN_PORTAL =
  process.env.NEXT_PUBLIC_UANATACA_SIGN_PORTAL ||
  'https://pasarelafirma-sandbox.uanatacaec.com';

// Base usada desde el navegador: las llamadas pasan por el rewrite de Next
// (`/api/uanataca/*` -> UANATACA_HOST) para evitar CORS. En SSR usamos HOST directo.
const BROWSER_BASE = '/api/uanataca';
const API_BASE = typeof window === 'undefined' ? HOST : BROWSER_BASE;

// IMPORTANTE: Next.js inyecta las variables NEXT_PUBLIC_* por análisis estático
// del código. Un acceso dinámico (process.env[variable]) NO dispara la
// sustitución y devuelve undefined en el bundle del navegador. Por eso
// leemos cada credencial con su nombre literal y las indexamos por RUC.
const CREDENTIALS_BY_RUC = {
  '0992537442001': {
    clientId: process.env.NEXT_PUBLIC_UANATACA_CLIENT_ID_LIDENAR,
    clientSecret: process.env.NEXT_PUBLIC_UANATACA_CLIENT_SECRET_LIDENAR,
    qrString: process.env.NEXT_PUBLIC_UANATACA_QR_STRING_LIDENAR,
  },
  '1792161037001': {
    clientId: process.env.NEXT_PUBLIC_UANATACA_CLIENT_ID_CELISTICS,
    clientSecret: process.env.NEXT_PUBLIC_UANATACA_CLIENT_SECRET_CELISTICS,
    qrString: process.env.NEXT_PUBLIC_UANATACA_QR_STRING_CELISTICS,
  },
};

// Posiciones de firma por tipo de documento (ajustables sin tocar la lógica).
// Coordenadas PDF en puntos (1pt = 1/72in). Origen Uanataca = esquina inferior-izquierda.
export const SIGNATURE_POSITIONS = {
  solicitud: { page: 0, posX: 50, posY: 50 },
  autorizacion: { page: 0, posX: 50, posY: 50 },
  pagare: { page: 0, posX: 50, posY: 150 },
};

/**
 * Resuelve la configuración de Uanataca correspondiente a una empresa por RUC.
 * Lanza error descriptivo si el RUC no está registrado o faltan credenciales.
 */
export function getUanatacaConfig(rucEmpresa) {
  if (!rucEmpresa) {
    throw new Error('No se recibió el RUC de la empresa para iniciar la firma.');
  }
  const empresa = UANATACA_EMPRESAS[rucEmpresa];
  if (!empresa) {
    throw new Error(
      `La empresa con RUC ${rucEmpresa} no está configurada para Uanataca.`
    );
  }
  const clientId = process.env[empresa.clientIdEnv];
  const clientSecret = process.env[empresa.clientSecretEnv];
  const qrString = process.env[empresa.qrStringEnv];
  // Fallback estático (Next.js sólo inyecta NEXT_PUBLIC_* vía acceso literal).
  const creds = CREDENTIALS_BY_RUC[rucEmpresa] || {};
  const finalClientId = clientId || creds.clientId;
  const finalClientSecret = clientSecret || creds.clientSecret;
  const finalQrString = qrString || creds.qrString;
  if (!finalClientId || !finalClientSecret) {
    throw new Error(
      `Faltan credenciales Uanataca para ${empresa.nombre}. ` +
        `Revisa ${empresa.clientIdEnv} y ${empresa.clientSecretEnv} en las variables de entorno.`
    );
  }
  if (!HOST) {
    throw new Error('NEXT_PUBLIC_UANATACA_HOST no está configurado.');
  }
  return {
    host: HOST,
    webhookUrl: WEBHOOK_URL || '',
    clientId: finalClientId,
    clientSecret: finalClientSecret,
    qrString: finalQrString || '',
    empresa,
  };
}

/**
 * Construye la lista de firmantes. Para los flujos actuales solo firma el
 * representante del cliente, todo en modalidad ONESHOT.
 */
function buildSigner(clienteEmpresa, identifier, index = 0) {
  const nombre = (clienteEmpresa.NOMBRE_REPRESENTANTE || '').trim();
  const partes = nombre.split(/\s+/);
  const cedula =
    clienteEmpresa.CEDULA_REPRESENTANTE || clienteEmpresa.RUC || '';
  return {
    identification: cedula,
    name: partes.slice(0, 2).join(' ') || nombre || '',
    lastName: partes[2] || '',
    lastName2: partes[3] || '',
    email: clienteEmpresa.EMAIL || '',
    phone: clienteEmpresa.NUM_TELEFONO || '',
    address: clienteEmpresa.DIRECCION_DOMICILIO || '',
    city: clienteEmpresa.CIUDAD || '',
    state: clienteEmpresa.PROVINCIA || '',
    country: 'EC',
    index,
    signatureType: 'ONESHOT',
    identifier,
  };
}

function buildSignaturesForFile(signerIndex, position) {
  return [
    {
      signerIndex,
      markQR: false,
      page: position.page,
      posX: position.posX,
      posY: position.posY,
      reason: 'Firma de aceptación',
      location: 'Ecuador',
    },
  ];
}

/**
 * Body para flujo de Cartera (Solicitud + Autorización).
 */
export function buildCarteraFlowBody({
  rucEmpresa,
  cliente,
  solicitudBase64,
  autorizacionBase64,
  transactionId,
}) {
  const cfg = getUanatacaConfig(rucEmpresa);
  const signer = buildSigner(cliente, 'DS0', 0);
  return {
    flowType: 'STANDARD',
    webhookUrl: cfg.webhookUrl,
    signers: [signer],
    customData: {
      transactionId: transactionId || `cartera-${cliente.ID_EMPRESA || Date.now()}`,
      subject: cfg.empresa.subject,
      message: cfg.empresa.messageHtml,
      channel: 'EMAIL_WHATSAPP',
      notifyChannel: true,
      notifyEndpoint: false,
      enforceDNI: true,
      qrString: cfg.qrString,
      files: [
        {
          base64: solicitudBase64,
          filename: 'solicitud',
          signatures: buildSignaturesForFile(0, SIGNATURE_POSITIONS.solicitud),
        },
        {
          base64: autorizacionBase64,
          filename: 'autorizacion',
          signatures: buildSignaturesForFile(0, SIGNATURE_POSITIONS.autorizacion),
        },
      ],
    },
  };
}

/**
 * Body para flujo de Pagaré.
 */
export function buildPagareFlowBody({
  rucEmpresa,
  cliente,
  pagareBase64,
  transactionId,
}) {
  const cfg = getUanatacaConfig(rucEmpresa);
  const signer = buildSigner(cliente, 'DS0', 0);
  return {
    flowType: 'STANDARD',
    webhookUrl: cfg.webhookUrl,
    signers: [signer],
    customData: {
      transactionId: transactionId || `pagare-${cliente.ID_EMPRESA || Date.now()}`,
      subject: `${cfg.empresa.subject} - Pagaré`,
      message: cfg.empresa.messageHtml,
      channel: 'EMAIL_WHATSAPP',
      notifyChannel: true,
      notifyEndpoint: false,
      enforceDNI: true,
      qrString: cfg.qrString,
      files: [
        {
          base64: pagareBase64,
          filename: 'pagare',
          signatures: buildSignaturesForFile(0, SIGNATURE_POSITIONS.pagare),
        },
      ],
    },
  };
}

/**
 * Crea un flujo en Uanataca. Retorna `{ id, status, active, flowType, ... }`.
 * Lanza Error si la respuesta no es 201.
 */
export async function createFlow(rucEmpresa, body) {
  const cfg = getUanatacaConfig(rucEmpresa);
  const url = `${API_BASE}/v2/flows`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': cfg.clientId,
      'x-api-secret': cfg.clientSecret,
    },
    body: JSON.stringify(body),
  });
  const text = await response.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }
  if (!response.ok) {
    const msg = (data && (data.message || data.error)) || text || 'Error desconocido';
    // eslint-disable-next-line no-console
    console.error('[Uanataca] POST /v2/flows error', response.status, data);
    throw new Error(`Uanataca [${response.status}] ${msg}`);
  }
  // eslint-disable-next-line no-console
  console.log('[Uanataca] POST /v2/flows response:', data);
  return data;
}

/**
 * GET genérico autenticado a la API de Flujos. Retorna el JSON ya parseado.
 */
async function uanatacaGet(rucEmpresa, path) {
  const cfg = getUanatacaConfig(rucEmpresa);
  const url = `${API_BASE}${path}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'x-api-key': cfg.clientId,
      'x-api-secret': cfg.clientSecret,
    },
  });
  const text = await response.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }
  if (!response.ok) {
    const msg = (data && (data.message || data.error)) || text || 'Error desconocido';
    throw new Error(`Uanataca [${response.status}] ${msg}`);
  }
  return data;
}

/** GET /v2/flows/{flowId} — estado del flujo. */
export function getFlow(rucEmpresa, flowId) {
  return uanatacaGet(rucEmpresa, `/v2/flows/${flowId}`);
}

/** GET /v2/flows/{flowId}/detail — detalle extendido (firmantes, firmas, docs). */
export function getFlowDetail(rucEmpresa, flowId) {
  return uanatacaGet(rucEmpresa, `/v2/flows/${flowId}/detail`);
}

/** GET /v2/flows/{flowId}/documents — lista de documentos del flujo. */
export function getFlowDocuments(rucEmpresa, flowId) {
  return uanatacaGet(rucEmpresa, `/v2/flows/${flowId}/documents`);
}

/**
 * GET /v2/flows/{flowId}/documents/{documentId} — un documento específico.
 * La respuesta trae el PDF en base64 (campo `content`/`document`/`data`).
 */
export function getFlowDocument(rucEmpresa, flowId, documentId) {
  return uanatacaGet(rucEmpresa, `/v2/flows/${flowId}/documents/${documentId}`);
}

/**
 * Descarga el documento firmado y lo abre en una nueva pestaña como PDF.
 * Devuelve el objectURL generado (por si el caller quiere revocarlo después).
 */
export async function openFlowDocumentPdf(rucEmpresa, flowId, documentId, filename = 'documento.pdf') {
  const data = await getFlowDocument(rucEmpresa, flowId, documentId);
  const base64 =
    (data && (data.content || data.document || data.data || data.base64 || data.fileContent)) || '';
  if (!base64 || typeof base64 !== 'string') {
    throw new Error('El documento no contiene contenido base64 reconocible');
  }
  // Decodificar base64 → Uint8Array
  const clean = base64.replace(/^data:application\/pdf;base64,/i, '');
  const binary = atob(clean);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i += 1) bytes[i] = binary.charCodeAt(i);
  const blob = new Blob([bytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, '_blank');
  if (!win) {
    // Fallback: forzar descarga si el navegador bloquea popups
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
  return url;
}

/**
 * Extrae el flowId desde un valor que puede ser el id directo o la URL
 * legacy `<SSO_PREFIX>/<flowId>` guardada en la columna SOO.
 */
export function extractFlowId(value) {
  if (!value) return '';
  const str = String(value).trim();
  if (!str || str === '<NULL>') return '';
  // Si es una URL, tomar el último segmento no vacío.
  if (/^https?:\/\//i.test(str) || str.includes('/')) {
    const parts = str.split('/').filter(Boolean);
    return parts[parts.length - 1] || '';
  }
  return str;
}

/**
 * URL legacy que se guarda en la columna SSO (`<SSO_PREFIX>/<flowId>`).
 * Mantiene el mismo formato que el CRM usaba con Nexxit para evitar impacto
 * en las vistas/consultas existentes.
 */
export function buildFlowStatusUrl(flowId) {
  if (!flowId) return '';
  return `${SSO_PREFIX}/${flowId}`;
}

/**
 * A partir del response del POST /v2/flows, intenta extraer la URL de firma
 * del primer firmante. Uanataca puede devolver el link completo o solo un token.
 * Formato final: `${SIGN_PORTAL}/entry?token=<token>`.
 */
export function extractSignerLink(result, signerIndex = 0) {
  if (!result) return '';
  const signers = result.signers || result.Signers || [];
  const signer = signers[signerIndex] || {};
  // Posibles campos según la API: linkSSO, ssoUrl, signatureUrl, url, link.
  const directLink =
    signer.linkSSO ||
    signer.ssoUrl ||
    signer.signatureUrl ||
    signer.signUrl ||
    signer.url ||
    signer.link ||
    result.linkSSO ||
    result.sso ||
    '';
  if (directLink && /^https?:\/\//i.test(directLink)) return directLink;
  const token = signer.token || signer.ssoToken || result.token || '';
  if (token) return `${SIGN_PORTAL}/entry?token=${token}`;
  return directLink || '';
}
