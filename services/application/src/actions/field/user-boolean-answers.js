const { Sort } = require('@identity-x/pagination');
const BooleanField = require('../../mongodb/models/field/boolean');

const { isArray } = Array;

module.exports = async ({
  applicationId,
  fieldIds,
  customBooleanFieldAnswers,
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
  const fields = await BooleanField.find(fieldQuery, {}, { sort: $sort.value });
  // return nothing when no custom selects are found.
  if (!fields.length) return [];

  // ensure answers are an array
  const customFieldAnswers = !isArray(customBooleanFieldAnswers) ||
  !customBooleanFieldAnswers.length
    ? []
    : customBooleanFieldAnswers;

  // return nothing when no answers are found and only answered questions have been requested.
  if (onlyAnswered && !customFieldAnswers.length) return [];

  const mapped = fields.map((field) => {
    const fieldAnswer = customFieldAnswers.find(answer => `${answer._id}` === `${field._id}`);
    const obj = {
      id: field._id,
      field,
      hasAnswered: Boolean(fieldAnswer.length),
      value: fieldAnswer.value,
    };
    return obj;
  });
  return onlyAnswered ? mapped.filter(field => field.hasAnswered) : mapped;
};
