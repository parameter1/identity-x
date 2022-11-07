const { createError } = require('micro');
const { createRequiredParamError } = require('@base-cms/micro').service;
const { tokenService } = require('@identity-x/service-clients');

const { Application, AppUserLogin } = require('../../mongodb/models');
const findByEmail = require('./find-by-email');

module.exports = async ({
  applicationId,
  token,
  ip,
  ua,
} = {}) => {
  if (!token) throw createRequiredParamError('token');
  if (!applicationId) throw createRequiredParamError('applicationId');

  const app = await Application.findById(applicationId, ['id']);
  if (!app) throw createError(404, `No application was found for '${applicationId}'`);

  const {
    aud: email, // the new email
    iss,
    jti,
    data: { email: currentEmail }, // the old email
  } = await tokenService.request('verify', { sub: 'app-user-change-email-link', token });

  if (!currentEmail) throw createError(400, 'The current email is missing from the token payload!');
  if (!email) throw createError(400, 'No email address was provided in the token payload');
  if (!iss) throw createError(400, 'No application ID was provided in the token payload');
  if (iss !== applicationId) throw createError(400, 'The requested application ID does not match the token payload');

  const [user, newUser] = await Promise.all([
    findByEmail({ applicationId, email: currentEmail }),
    findByEmail({ applicationId, email }),
  ]);
  if (!user) throw createError(404, `No user was found for '${currentEmail}'`);
  if (newUser && newUser.verified) throw createError(400, `The email address ${email} cannot be used. XAVF`);

  // Add the previous address to the history
  user.emails.push(user.email);
  // If there is an existing unverified user delete it: Unverified data is untrusted.
  if (newUser) await newUser.delete();

  // Create the authenticated token.
  const { token: authToken, payload } = await tokenService.request('create', {
    sub: 'app-user-auth',
    iss: applicationId,
    payload: { aud: email },
  });

  // Invalidate the change email link token (but do not await)
  tokenService.request('invalidate', { jti });

  // Save the login with the auth token ID (but do not await)
  AppUserLogin.create({
    applicationId,
    email,
    tokenId: payload.jti,
    ip,
    ua,
  });

  // Update the user with last logged in date and verified flag
  user.set({
    email, // Ensure the new email address is set
    verified: true,
    lastLoggedIn: new Date(),
  });
  await user.save();

  return { user: user.toObject(), token: { id: payload.jti, value: authToken } };
};
