const { createError } = require('micro');
const { createRequiredParamError } = require('@base-cms/micro').service;
const { tokenService, mailerService, organizationService } = require('@identity-x/service-clients');
const { getAsObject } = require('@base-cms/object-path');
const { stripLines } = require('@identity-x/utils');
const { Application } = require('../../mongodb/models');
const { SENDING_DOMAIN } = require('../../env');
const findByEmail = require('./find-by-email');
const { isBurnerDomain } = require('../../utils/burner-email');

const createLoginToken = ({
  email,
  data = {},
  applicationId,
  ttl = 60 * 60,
} = {}) => tokenService.request('create', {
  payload: { aud: email, data },
  iss: applicationId,
  sub: 'app-user-login-link',
  ttl,
});

module.exports = async ({
  authUrl,
  redirectTo,
  applicationId,
  appContextId,
  source,
  email,
} = {}) => {
  if (!authUrl) throw createRequiredParamError('authUrl');
  if (!applicationId) throw createRequiredParamError('applicationId');
  if (!email) throw createRequiredParamError('email');

  const [app, user] = await Promise.all([
    Application.findById(applicationId, ['id', 'name', 'email', 'organizationId', 'contexts']),
    findByEmail({ applicationId, email, fields: ['id', 'email', 'domain'] }),
  ]);

  if (!app) throw createError(404, `No application was found for '${applicationId}'`);
  if (!user) throw createError(404, `No user was found for '${email}'`);

  // Ensure the email domain is valid (it's possible imported or old data may be invalid).
  if (isBurnerDomain(user.domain)) throw createError(422, `The email domain "${user.domain}" is not allowed. Please re-register with a valid email address.`);

  const org = await organizationService.request('findById', { id: app.organizationId, fields: ['company'] });
  if (!org) throw createError(404, `No organization was found for '${app.organizationId}'`);
  const company = getAsObject(org, 'company');

  // Load the active context
  const context = app.contexts.id(appContextId) || {};
  const appName = context.name || app.name;

  const addressFields = ['name', 'streetAddress', 'city', 'regionName', 'postalCode'];
  const addressValues = addressFields.map(field => company[field]).filter(v => v).map(stripLines);
  const supportEmail = context.email || app.email || company.supportEmail;
  if (supportEmail) addressValues.push(supportEmail);

  const { token } = await createLoginToken({ applicationId, email: user.email, data: { source } });
  let url = `${authUrl}?token=${token}`;
  if (redirectTo) url = `${url}&redirectTo=${encodeURIComponent(redirectTo)}`;

  const supportEmailHtml = supportEmail ? ` or <a href="mailto:${supportEmail}">contact our support staff</a>` : '';
  const supportEmailText = supportEmail ? ` or contact our support staff at ${supportEmail}` : '';

  const alternativesByAppId = {
    '5e28a4c858e67b86c955ae4d': {
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
          <p>Recientemente solicitó iniciar sesión en <strong>${appName}</strong>. Este enlace esta habilitado por una hora y caducará inmediatamente después de su uso.</p>
          <p><a href="${url}">Iniciar sesión en ${appName}</a></p>
          <p>Si no solicitó este enlace, simplemente ignore este correo electrónico${supportEmail ? ` o <a href="mailto:${supportEmail}">comuníquese con nuestro personal de soporte</a>` : ''}.</p>
          <hr>
          <small style="font-color: #ccc;">
            <p>Agregue <em>${SENDING_DOMAIN}</em> a su libreta de direcciones o lista de remitentes seguros para asegurarse de recibir nuestros correos electrónicos en el futuro</p>
            <p>Está recibiendo este correo electrónico porque se realizó una solicitud de inicio de sesión en ${appName}.</p>
            <p>Para obtener información adicional, comuníquese con ${appName} ${addressValues.join(', ')}.</p>
          </small>
        </body>
      </html>
    `,
      text: `
      Recientemente solicitó iniciar sesión en ${appName}. Este enlace esta habilitado por una hora y caducará inmediatamente después de su uso.

      Iniciar sesión en ${appName}:
      ${url}

      Si no solicitó este enlace, simplemente ignore este correo electrónico${supportEmail ? ` o comuníquese con nuestro personal de soporte a ${supportEmail}` : ''}

      -------------------------

      Agregue ${SENDING_DOMAIN} a su libreta de direcciones o lista de remitentes seguros para asegurarse de recibir nuestros correos electrónicos en el futuro
      Usted esta recibiendo este correo porque una solicitud fue hecha a ${appName}.
      Para obtener información adicional, comuníquese con ${appName} ${addressValues.join(', ')}.
    `,
      subject: 'Su enlace de inicio de sesión personal',
    },
  };

  const html = alternativesByAppId[applicationId] && alternativesByAppId[applicationId].html ? alternativesByAppId[applicationId].html : `
    <!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
        <meta name="viewport" id="viewport" content="width=device-width,minimum-scale=1.0,maximum-scale=10.0,initial-scale=1.0">
        <title>Your personal login link</title>
      </head>
      <body>
        <p>You recently requested to log in to <strong>${appName}</strong>. This link is good for one hour and will expire immediately after use.</p>
        <p><a href="${url}">Login to ${appName}</a></p>
        <p>If you didn't request this link, simply ignore this email${supportEmailHtml}.</p>
        <hr>
        <small style="font-color: #ccc;">
          <p>Please add <em>${SENDING_DOMAIN}</em> to your address book or safe sender list to ensure you receive future emails from us.</p>
          <p>You are receiving this email because a login request was made on ${appName}.</p>
          <p>For additional information please contact ${appName} c/o ${addressValues.join(', ')}.</p>
        </small>
      </body>
    </html>
  `;

  const text = alternativesByAppId[applicationId] && alternativesByAppId[applicationId].text ? alternativesByAppId[applicationId].text : `
  You recently requested to log in to ${appName}. This link is good for one hour and will expire immediately after use.

  Login to ${appName} by visiting this link:
  ${url}

  If you didn't request this link, simply ignore this email${supportEmailText}.

  -------------------------

  Please add ${SENDING_DOMAIN} to your address book or safe sender list to ensure you receive future emails from us.
  You are receiving this email because a login request was made on ${appName}.
  For additional information please contact ${appName} c/o ${addressValues.join(', ')}.
  `;

  const subject = alternativesByAppId[applicationId] && alternativesByAppId[applicationId].subject ? alternativesByAppId[applicationId].subject : 'Your personal login link';

  await mailerService.request('send', {
    to: user.email,
    from: `${appName} <noreply@${SENDING_DOMAIN}>`,
    subject,
    html,
    text,
  });
  return 'ok';
};
