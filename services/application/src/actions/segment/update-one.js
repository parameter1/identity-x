const { createError } = require('micro');
const { createRequiredParamError } = require('@base-cms/micro').service;
const { handleError } = require('@identity-x/utils').mongoose;
const { isObject } = require('@base-cms/utils');

const { Application, Segment } = require('../../mongodb/models');

module.exports = async ({ id, applicationId, payload } = {}) => {
  if (!id) throw createRequiredParamError('id');
  if (!applicationId) throw createRequiredParamError('applicationId');
  if (!isObject(payload)) throw createRequiredParamError('payload');

  const application = await Application.findById(applicationId, ['id']);
  if (!application) throw createError(404, `No application was found for '${applicationId}'`);

  const segment = await Segment.findByIdForApp(id, applicationId);
  if (!segment) throw createError(404, `No segment was found for '${id}'`);
  segment.set(payload);

  try {
    await segment.save();
    return segment;
  } catch (e) {
    throw handleError(createError, e);
  }
};
