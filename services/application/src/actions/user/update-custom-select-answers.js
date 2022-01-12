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
  const userObj = user.customSelectFieldAnswers.reduce(
    (obj, item) => Object.assign(obj, { [item._id]: item.values }), {},
  );

  const newAnswers = answers
    .filter(({ optionIds }) => optionIds.length) // ignore/unset fields without options
    .map(({ fieldId, optionIds }) => ({ _id: fieldId, values: optionIds }))
    .reduce(
      (obj, item) => Object.assign(obj, { [item._id]: item.values }), {},
    );

  // merge new and old ansers to account for old non active answers
  const mergedAnwsers = { ...userObj, ...newAnswers };

  // convert merged answers into valid array of { _id, values } answers
  const toSet = Object.keys(mergedAnwsers).map((key) => {
    const obj = { _id: key, values: mergedAnwsers[key] };
    return obj;
  });

  user.set('customSelectFieldAnswers', toSet);
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
