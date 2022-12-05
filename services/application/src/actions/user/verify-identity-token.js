const { createError } = require('micro');
const { createRequiredParamError } = require('@base-cms/micro').service;
const { tokenService } = require('@identity-x/service-clients');
const { AppUser } = require('../../mongodb/models');

module.exports = async ({ token } = {}) => {
  if (!token) throw createRequiredParamError('token');
  try {
    const verified = await tokenService.request('verify', { sub: 'app-user-identity', token });
    console.log(verified);

    const { aud: id, iss: applicationId } = verified;
    if (!id) throw createError(400, 'No user id was provided in the token payload');
    if (!applicationId) throw createError(400, 'No application id was provided in the token payload');

    const user = await AppUser.findOne({ applicationId, _id: id });

    if (!user) throw createError(404, `No user was found for '${id}'`);
    if (user.id !== id) throw createError(401, 'The user id does not match the token id.');

    return { user, token: verified };
  } catch (e) {
    throw createError(401, e.message);
  }
};
