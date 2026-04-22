// Plantillas HTML de correo por empresa para Uanataca API v2.
// Las variables {{name}} y {{linkSSO}} son reemplazadas por Uanataca
// antes de enviar el correo al firmante.

const buildMessageHtml = ({ empresaNombre }) => `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Firma electrónica – ${empresaNombre}</title>
</head>
<body style="font-family: Arial, sans-serif; margin:0; padding:0; background:#f4f4f4;">
  <div style="max-width:600px; margin:20px auto; background:#fff; padding:30px; border-radius:8px;">
    <h2 style="color:#1a237e; margin-top:0;">Proceso de firma electrónica</h2>
    <p>Hola {{name}},</p>
    <p>
      ${empresaNombre} ha iniciado un proceso de firma electrónica con tus documentos de crédito.
      Para continuar con el proceso, haz clic en el siguiente enlace:
    </p>
    <p style="text-align:center; margin:30px 0;">
      <a href="{{linkSSO}}"
         style="background:#1a237e; color:#fff; padding:12px 28px; text-decoration:none; border-radius:4px; display:inline-block;">
        Firmar documentos
      </a>
    </p>
    <p style="font-size:12px; color:#666;">
      Si el botón no funciona, copia y pega este enlace en tu navegador:<br/>
      <span style="word-break:break-all;">{{linkSSO}}</span>
    </p>
    <hr style="border:none; border-top:1px solid #eee; margin:24px 0;"/>
    <p style="font-size:11px; color:#999;">
      Este correo fue enviado automáticamente por ${empresaNombre} a través de Uanataca.
      Si no solicitaste este proceso, por favor ignora este mensaje.
    </p>
  </div>
</body>
</html>
`.trim();

export const UANATACA_EMPRESAS = {
  // Lidenar S.A.
  '0992537442001': {
    nombre: 'Lidenar S.A.',
    nombreCorto: 'Lidenar',
    subject: 'Lidenar S.A. - Firma Electrónica de Documentos de Crédito',
    clientIdEnv: 'NEXT_PUBLIC_UANATACA_CLIENT_ID_LIDENAR',
    clientSecretEnv: 'NEXT_PUBLIC_UANATACA_CLIENT_SECRET_LIDENAR',
    qrStringEnv: 'NEXT_PUBLIC_UANATACA_QR_STRING_LIDENAR',
    get messageHtml() {
      return buildMessageHtml({ empresaNombre: 'Lidenar S.A.' });
    },
  },
  // Movil Celistic S.A.
  '1792161037001': {
    nombre: 'Móvil Celistic S.A.',
    nombreCorto: 'Movil Celistic',
    subject: 'Móvil Celistic S.A. - Firma Electrónica de Documentos de Crédito',
    clientIdEnv: 'NEXT_PUBLIC_UANATACA_CLIENT_ID_CELISTICS',
    clientSecretEnv: 'NEXT_PUBLIC_UANATACA_CLIENT_SECRET_CELISTICS',
    qrStringEnv: 'NEXT_PUBLIC_UANATACA_QR_STRING_CELISTICS',
    get messageHtml() {
      return buildMessageHtml({ empresaNombre: 'Móvil Celistic S.A.' });
    },
  },
};
