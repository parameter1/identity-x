const { createError } = require('micro');
const { createRequiredParamError } = require('@base-cms/micro').service;
const { tokenService } = require('@identity-x/service-clients');
const findByEmail = require('./find-by-email');

module.exports = async ({ applicationId, token, returnUser = false } = {}) => {
  if (!applicationId) throw createRequiredParamError('applicationId');
  if (!token) throw createRequiredParamError('token');

  const { aud: email, jti, iss } = await tokenService.request('verify', { sub: 'app-user-auth', token });
  if (!jti) throw createError(400, 'No token identifier was provided.');
  if (iss !== applicationId) throw createError(400, 'The requested application ID does not match the token payload');
  // Invalidate the login link token.
  tokenService.request('invalidate', { jti });

  if (returnUser) {
    const user = await findByEmail({ applicationId, email });
    return user;
  }
  return 'ok';
};
