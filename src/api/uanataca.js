// Cliente Uanataca API de Flujos 2 V1.0 (multi-empresa)
// Docs:
//   POST {host}/v2/flows  -> crea flujo de firma (OneShot)
//   Headers auth: x-api-key (clientId) + x-api-secret (clientSecret)
//
// El flujo migrado reemplaza al anterior wrapper Nexxit.

import { UANATACA_EMPRESAS } from './uanataca.templates';

const HOST = process.env.NEXT_PUBLIC_UANATACA_HOST;
const WEBHOOK_URL = process.env.NEXT_PUBLIC_UANATACA_WEBHOOK_URL;

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
  if (!clientId || !clientSecret) {
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
    clientId,
    clientSecret,
    qrString: qrString || '',
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
  const url = `${cfg.host}/v2/flows`;
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
    throw new Error(`Uanataca [${response.status}] ${msg}`);
  }
  return data;
}

/**
 * URL de consulta del flujo (no es un link de firma para el usuario;
 * el linkSSO real llega al firmante por email/WhatsApp).
 */
export function buildFlowStatusUrl(flowId) {
  if (!flowId || !HOST) return '';
  return `${HOST}/v2/flows/${flowId}`;
}
