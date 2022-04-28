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
  const userObj = user.customSelectFieldAnswers.reduce((obj, { _id, values, writeInValues }) => ({
    ...obj,
    [_id]: { values, writeInValues },
  }), {});

  const newAnswers = answers
    .map(item => ({ _id: item.fieldId, ...item }))
    .reduce((obj, { _id, optionIds, writeInValues }) => ({
      ...obj,
      [_id]: {
        values: optionIds,
        writeInValues: (writeInValues || []).map(v => ({ _id: v.optionId, value: v.value })),
      },
    }), {});

  // merge new and old answers to account for old non active answers
  const mergedAnswers = { ...userObj, ...newAnswers };

  // convert merged answers into valid array of { _id, values } answers
  const toSet = Object.keys(mergedAnswers).map((key) => {
    const { values, writeInValues } = mergedAnswers[key];
    return { _id: key, values, writeInValues };
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
