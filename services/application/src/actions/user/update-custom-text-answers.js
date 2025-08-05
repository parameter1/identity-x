const { createError } = require('micro');
const { createRequiredParamError } = require('@base-cms/micro').service;
const { handleError } = require('@identity-x/utils').mongoose;

const { AppUser } = require('../../mongodb/models');
const setCustomTextAnswers = require('./utils/set-custom-text-answers');


const { isArray } = Array;

module.exports = async ({
  id,
  applicationId,
  answers,
  profileLastVerifiedAt,
} = {}) => {
  if (!id) throw createRequiredParamError('id');
  if (!applicationId) throw createRequiredParamError('applicationId');

  const user = await AppUser.findByIdForApp(id, applicationId);
  if (!user) throw createError(404, `No user was found for '${id}'`);

  // do not update user answers when passed answers are not an array
  if (!isArray(answers)) return user;

  setCustomTextAnswers({ user, answers });

  if (profileLastVerifiedAt) {
    user.set('profileLastVerifiedAt', profileLastVerifiedAt);
    user.set('forceProfileReVerification', false);
  }
  try {
    await user.save();
    return user;
  } catch (e) {
    throw handleError(createError, e);
  }
};
