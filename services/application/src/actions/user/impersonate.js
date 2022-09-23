const { createError } = require('micro');
const { createRequiredParamError } = require('@base-cms/micro').service;
const { tokenService } = require('@identity-x/service-clients');

const { Application, AppUser, AppUserLogin } = require('../../mongodb/models');

module.exports = async ({
  applicationId,
  orgUserId,
  verify,
  id,
  ip,
  ua,
} = {}) => {
  if (!id) throw createRequiredParamError('id');
  if (!orgUserId) throw createRequiredParamError('orgUserId');
  if (!applicationId) throw createRequiredParamError('applicationId');

  const app = await Application.findById(applicationId, ['id']);
  if (!app) throw createError(404, `No application was found for '${applicationId}'`);

  const user = await AppUser.findById(id);
  if (!user) throw createError(404, `No user was found for '${id}'`);

  // Create the authenticated token.
  const { token: authToken, payload } = await tokenService.request('create', {
    sub: 'app-user-auth',
    iss: applicationId,
    payload: { aud: user.email },
  });

  // Save the login with the auth token ID (but do not await)
  AppUserLogin.create({
    applicationId,
    email: user.email,
    tokenId: payload.jti,
    ip,
    ua,
  });

  // Update the user with last logged in date and verified flag
  if (verify) {
    user.set({
      verified: true,
      lastLoggedIn: new Date(),
    });
  }
  await user.save();

  return { user: user.toObject(), token: { id: payload.jti, value: authToken } };
};
