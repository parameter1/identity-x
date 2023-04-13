const { createRequiredParamError } = require('@base-cms/micro').service;

module.exports = async (Model, { id, applicationId, fields }) => {
  if (!id) throw createRequiredParamError('id');
  if (!applicationId) throw createRequiredParamError('applicationId');
  const doc = await Model.findByIdForApp(id, applicationId, fields);
  return doc || null;
};
