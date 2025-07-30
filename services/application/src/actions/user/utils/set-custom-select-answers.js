const { createRequiredParamError } = require('@base-cms/micro').service;

module.exports = ({ user, answers }) => {
  if (!answers) throw createRequiredParamError('answers');

  // get all current answers as object { id, value }
  const userObj = user.customSelectFieldAnswers.reduce((obj, { _id, values, writeInValues }) => ({
    ...obj,
    [_id]: { values, writeInValues },
  }), {});

  const newAnswers = answers
    // Allow for optionIds to be empty if forceUnset is set to true
    .filter(({ optionIds, forceUnset }) => optionIds.length || forceUnset)
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
};
