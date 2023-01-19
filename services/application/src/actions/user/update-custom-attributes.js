const { createError } = require('micro');
const { createRequiredParamError } = require('@base-cms/micro').service;
const { handleError } = require('@identity-x/utils').mongoose;

const { AppUser } = require('../../mongodb/models');

module.exports = async ({
  id,
  applicationId,
  attributes,
} = {}) => {
  if (!id) throw createRequiredParamError('id');
  if (!applicationId) throw createRequiredParamError('applicationId');

  const user = await AppUser.findByIdForApp(id, applicationId);
  if (!user) throw createError(404, `No user was found for '${id}'`);

  Object.keys(attributes).forEach((k) => {
    let v = attributes[k];
    if (typeof v === 'string') {
      // Trim strings
      v = `${v}`.trim();
      // Unset if sent an empty value
      if (v === '') v = null;
    }
    user.set(`customAttributes.${k}`, v === null ? undefined : v);
  });

  try {
    await user.save();
    return user;
  } catch (e) {
    throw handleError(createError, e);
  }
};
