const { Sort } = require('@identity-x/pagination');
const TextField = require('../../mongodb/models/field/text');

const { isArray } = Array;

module.exports = async ({
  applicationId,
  fieldIds,
  customTextFieldAnswers,
  onlyAnswered,
  onlyActive,
  sort,
} = {}) => {
  const $sort = new Sort(sort);
  const fieldQuery = {
    applicationId,
    ...(isArray(fieldIds) && fieldIds.length && { _id: { $in: fieldIds } }),
    ...(onlyActive && { active: { $ne: false } }),
  };
  const fields = await TextField.find(fieldQuery, {}, { sort: $sort.value });
  // return nothing when no custom booleans are found.
  if (!fields.length) return [];

  // ensure answers are an array
  const customFieldAnswers = !isArray(customTextFieldAnswers)
  || !customTextFieldAnswers.length
    ? []
    : customTextFieldAnswers;


  // return nothing when no answers are found and only answered questions have been requested.
  if (onlyAnswered && !customFieldAnswers.length) return [];

  const mapped = fields.map((field) => {
    const fieldAnswer = customFieldAnswers.find(answer => `${answer._id}` === `${field._id}`);
    const answer = fieldAnswer ? fieldAnswer.value : null;
    return {
      id: field._id,
      field,
      hasAnswered: Boolean(fieldAnswer),
      answer,
    };
  });
  return onlyAnswered ? mapped.filter(field => field.hasAnswered) : mapped;
};
