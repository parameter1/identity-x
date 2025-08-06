const { createRequiredParamError } = require('@base-cms/micro').service;

module.exports = ({ user, answers }) => {
  if (!answers) throw createRequiredParamError('answers');
  // get all current answers as object { id, value }
  const userObj = user.customTextFieldAnswers.reduce(
    (obj, item) => ({ ...obj, [item._id]: item.value }), {},
  );

  // get new answers as object { id, value }
  const newAnswers = answers.reduce(
    (obj, item) => ({ ...obj, [item.fieldId]: item.value }), {},
  );

  // merge new and old ansers to account for old non active answers
  const mergedAnswers = { ...userObj, ...newAnswers };

  // convert merged answers into valid array of { _id, value } answers
  const toSet = Object.keys(mergedAnswers).map((key) => {
    const obj = { _id: key, value: mergedAnswers[key] };
    return obj;
  });

  user.set('customTextFieldAnswers', toSet);
};
