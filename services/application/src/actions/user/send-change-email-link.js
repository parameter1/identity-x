const { createError } = require('micro');
const { createRequiredParamError } = require('@base-cms/micro').service;
const { tokenService, mailerService, organizationService } = require('@identity-x/service-clients');
const { getAsObject } = require('@base-cms/object-path');
const { stripLines } = require('@identity-x/utils');
const { Application } = require('../../mongodb/models');
const { SENDING_DOMAIN } = require('../../env');
const findByEmail = require('./find-by-email');
const { isBurnerDomain } = require('../../utils/burner-email');

const createToken = ({
  email,
  data = {},
  applicationId,
  ttl = 60 * 60,
} = {}) => tokenService.request('create', {
  payload: { aud: email, data },
  iss: applicationId,
  sub: 'app-user-change-email-link',
  ttl,
});

module.exports = async ({
  authUrl,
  redirectTo,
  applicationId,
  appContextId,
  email,
  newEmail,
} = {}) => {
  if (!authUrl) throw createRequiredParamError('authUrl');
  if (!applicationId) throw createRequiredParamError('applicationId');
  if (!email) throw createRequiredParamError('email');
  if (!newEmail) throw createRequiredParamError('newEmail');
  if (email === newEmail) throw createError(400, 'New email must be different from current email.');

  const [app, user, newUser] = await Promise.all([
    Application.findById(applicationId, ['id', 'name', 'email', 'organizationId', 'contexts']),
    findByEmail({ applicationId, email, fields: ['id', 'email', 'domain', 'verified'] }),
    findByEmail({ applicationId, email: newEmail, fields: ['id', 'email', 'domain', 'verified'] }),
  ]);

  if (!app) throw createError(404, `No application was found for '${applicationId}'`);
  if (!user) throw createError(404, `No user was found for '${email}'`);
  if (newUser && newUser.verified) throw createError(400, `The email address ${newEmail} cannot be used. XAVF`);

  // Ensure the new email domain is valid.
  const [, domain] = newEmail.split('@');
  if (isBurnerDomain(domain)) throw createError(422, `The email domain "${domain}" is not allowed. Please use a valid email address.`);

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

  const { token } = await createToken({ applicationId, email: newEmail, data: { email } });
  let url = `${authUrl}?token=${token}`;
  if (redirectTo) url = `${url}&redirectTo=${encodeURIComponent(redirectTo)}`;

  const supportEmailHtml = supportEmail ? ` or <a href="mailto:${supportEmail}">contact our support staff</a>` : '';
  const supportEmailText = supportEmail ? ` or contact our support staff at ${supportEmail}` : '';

  const html = `
    <!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
        <meta name="viewport" id="viewport" content="width=device-width,minimum-scale=1.0,maximum-scale=10.0,initial-scale=1.0">
        <title>Change your email address on ${appName}</title>
      </head>
      <body>
        <p>You recently requested to change your email address on <strong>${appName}</strong>. To complete this request, click on the link below. This link is good for one hour and will expire immediately after use.</p>
        <p><a href="${url}">Change my email on ${appName}</a></p>
        <p>If you didn't request this link, simply ignore this email${supportEmailHtml}.</p>
        <hr>
        <small style="font-color: #ccc;">
          <p>Please add <em>${SENDING_DOMAIN}</em> to your address book or safe sender list to ensure you receive future emails from us.</p>
          <p>You are receiving this email because a request to change your email address was made on ${appName}.</p>
          <p>For additional information please contact ${appName} c/o ${addressValues.join(', ')}.</p>
        </small>
      </body>
    </html>
  `;

  const text = `
You recently requested to change your email address on ${appName}. This link is good for one hour and will expire immediately after use.

Change your email on ${appName} by visiting this link:
${url}

If you didn't request this link, simply ignore this email${supportEmailText}.

-------------------------

Please add ${SENDING_DOMAIN} to your address book or safe sender list to ensure you receive future emails from us.
You are receiving this email because a login request was made on ${appName}.
For additional information please contact ${appName} c/o ${addressValues.join(', ')}.
  `;

  await mailerService.request('send', {
    to: newEmail,
    from: `${appName} <noreply@${SENDING_DOMAIN}>`,
    subject: `Change your email address on ${appName}`,
    html,
    text,
  });

  // Unverify the existing user
  user.verified = false;
  await user.save();

  return 'ok';
};
