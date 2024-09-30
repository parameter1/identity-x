const stripTags = require('striptags');

module.exports = ({
  sendingDomain,
  supportEmail,
  url,
  appName,
  addressValues,
  loginLinkTemplate,
  user,
} = {}) => {
  const { verified } = user;
  const subject = loginLinkTemplate.subject || 'Su enlace de inicio de sesión personal';
  const unverifiedVerbiage = loginLinkTemplate.unverifiedVerbiage || `Recientemente solicitó iniciar sesión en <strong>${appName}</strong>. Este enlace esta habilitado por una hora y caducará inmediatamente después de su uso.`;
  const verifiedVerbiage = loginLinkTemplate.verifiedVerbiage || `Recientemente solicitó iniciar sesión en <strong>${appName}</strong>. Este enlace esta habilitado por una hora y caducará inmediatamente después de su uso.`;
  const verbiage = verified ? verifiedVerbiage : unverifiedVerbiage;
  const loginLinkStyle = loginLinkTemplate.loginLinkStyle ? loginLinkTemplate.loginLinkStyle : '';
  const loginLinkText = loginLinkTemplate.loginLinkText ? loginLinkTemplate.loginLinkText : `Iniciar sesión en ${appName}`;
  return ({
    html: `
    <!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
    <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
        <meta name="viewport" id="viewport" content="width=device-width,minimum-scale=1.0,maximum-scale=10.0,initial-scale=1.0">
        <title>Su enlace de inicio de sesión personal</title>
      </head>
      <body>
        <p>${verbiage}</p>
        <p>
          <a href="${url}" style="${loginLinkStyle}">
            <strong>
              ${loginLinkText}
            </strong>
          </a>
        </p>
        <p>Si no solicitó este enlace, simplemente ignore este correo electrónico${supportEmail ? ` o <a href="mailto:${supportEmail}">comuníquese con nuestro personal de soporte</a>` : ''}.</p>
        <hr>
        <small style="font-color: #ccc;">
          <p>Agregue <em>${sendingDomain}</em> a su libreta de direcciones o lista de remitentes seguros para asegurarse de recibir nuestros correos electrónicos en el futuro</p>
          <p>Está recibiendo este correo electrónico porque se realizó una solicitud de inicio de sesión en ${appName}.</p>
          <p>Para obtener información adicional, comuníquese con ${appName} ${addressValues.join(', ')}.</p>
        </small>
      </body>
    </html>
  `,
    text: `
${stripTags(verbiage)}

${loginLinkText}:
${url}

Si no solicitó este enlace, simplemente ignore este correo electrónico${supportEmail ? ` o comuníquese con nuestro personal de soporte a ${supportEmail}` : ''}

-------------------------

Agregue ${sendingDomain} a su libreta de direcciones o lista de remitentes seguros para asegurarse de recibir nuestros correos electrónicos en el futuro
Usted esta recibiendo este correo porque una solicitud fue hecha a ${appName}.
Para obtener información adicional, comuníquese con ${appName} ${addressValues.join(', ')}.
  `,
    subject,
  });
};
