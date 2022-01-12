const { createError } = require('micro');
const { createRequiredParamError } = require('@base-cms/micro').service;
const { handleError } = require('@identity-x/utils').mongoose;

const { AppUser } = require('../../mongodb/models');

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

  // get all current answers as object { id, value }
  const userObj = user.customBooleanFieldAnswers.reduce(
    (obj, item) => Object.assign(obj, { [item._id]: item.value }), {},
  );

  // get new answers as object { id, value }
  const newAnswers = answers.reduce(
    (obj, item) => Object.assign(obj, { [item.fieldId]: item.value }), {},
  );

  // merge new and old ansers to account for old non active answers
  const mergedAnwsers = { ...userObj, ...newAnswers };

  // convert merged answers into valid array of { _id, value } answers
  const toSet = Object.keys(mergedAnwsers).map((key) => {
    const obj = { _id: key, value: mergedAnwsers[key] };
    return obj;
  });

  user.set('customBooleanFieldAnswers', toSet);
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
