const { createError } = require('micro');
const { createRequiredParamError } = require('@base-cms/micro').service;
const { tokenService } = require('@identity-x/service-clients');

const findByEmail = require('./find-by-email');

const sub = 'user-api-token';

module.exports = async ({ email } = {}) => {
  if (!email) throw createRequiredParamError('email');
  const user = await findByEmail({ email, fields: ['id', 'email'] });
  if (!user) throw createError(404, `No user was found for '${email}'`);

  const existingToken = await tokenService.request('findOne', {
    query: { sub, 'payload.aud': email },
  });
  if (existingToken) {
    // re-use existing api tokens.
    return tokenService.request('sign', { payload: existingToken.payload });
  }
  const { token } = await tokenService.request('create', {
    payload: { aud: email },
    sub,
  });
  return token;
};
