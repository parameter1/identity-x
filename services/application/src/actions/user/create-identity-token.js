const { createError } = require('micro');
const { createRequiredParamError } = require('@base-cms/micro').service;
const { tokenService } = require('@identity-x/service-clients');
const { Application, AppUser } = require('../../mongodb/models');

module.exports = async ({
  applicationId,
  id,
} = {}) => {
  if (!applicationId) throw createRequiredParamError('applicationId');
  if (!id) throw createRequiredParamError('id');

  const [app, user] = await Promise.all([
    Application.findById(applicationId, ['id', 'name', 'email', 'organizationId', 'contexts']),
    AppUser.findOne({ applicationId, _id: id }),
  ]);

  if (!app) throw createError(404, `No application was found for '${applicationId}'`);
  if (!user) throw createError(404, `No user was found for '${id}'`);

  // Load the active context
  const { token } = await tokenService.request('create', {
    payload: { aud: user.id },
    iss: applicationId,
    sub: 'app-user-identity',
    ttl: 2 * 365 * 24 * 60 * 60,
  });

  return token;
};
