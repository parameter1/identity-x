const { createError } = require('micro');
const { createRequiredParamError } = require('@base-cms/micro').service;
const { tokenService, mailerService, organizationService } = require('@identity-x/service-clients');
const { getAsObject } = require('@base-cms/object-path');
const { stripLines } = require('@identity-x/utils');
const { Application } = require('../../mongodb/models');
const { SENDING_DOMAIN: sendingDomain } = require('../../env');
const findByEmail = require('./find-by-email');
const { isBurnerDomain } = require('../../utils/burner-email');
const templates = require('../../email-templates/login-link');

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
    Application.findById(applicationId, ['id', 'name', 'email', 'loginLinkTemplate', 'language', 'organizationId', 'contexts']),
    findByEmail({ applicationId, email, fields: ['id', 'email', 'verified', 'domain'] }),
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
  const language = context.language || app.language || 'en-us';

  if (supportEmail) addressValues.push(supportEmail);

  const { token } = await createLoginToken({ applicationId, email: user.email, data: { source } });
  let url = `${authUrl}?token=${token}`;
  if (redirectTo) url = `${url}&redirectTo=${encodeURIComponent(redirectTo)}`;

  const appTemp = app.loginLinkTemplate || {};
  const contextTemp = context.loginLinkTemplate || {};
  const loginLinkTemplate = {
    ...((contextTemp.subjectLine || appTemp.subjectLine)
      && { subjectLine: contextTemp.subjectLine || appTemp.subjectLine }
    ),
    ...((contextTemp.unverifiedVerbiage || appTemp.unverifiedVerbiage)
      && { unverifiedVerbiage: contextTemp.unverifiedVerbiage || appTemp.unverifiedVerbiage }
    ),
    ...((contextTemp.verifiedVerbiage || appTemp.verifiedVerbiage)
      && { verifiedVerbiage: contextTemp.verifiedVerbiage || appTemp.verifiedVerbiage }
    ),
  };

  const { subject, html, text } = templates[language] ? templates[language]({
    sendingDomain,
    supportEmail,
    url,
    appName,
    addressValues,
    loginLinkTemplate,
    user,
  }) : templates['en-us']({
    sendingDomain,
    supportEmail,
    url,
    appName,
    addressValues,
    loginLinkTemplate,
    user,
  });

  await mailerService.request('send', {
    to: user.email,
    from: `${appName} <noreply@${sendingDomain}>`,
    subject,
    html,
    text,
  });
  return 'ok';
};
