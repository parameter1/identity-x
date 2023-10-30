const { service } = require('@base-cms/micro');
const AppUser = require('../../mongodb/models/app-user');

const { createRequiredParamError } = service;

module.exports = async ({ applicationId, identifier, namespace: ns }) => {
  if (!applicationId) throw createRequiredParamError('applicationId');
  if (!identifier) throw createRequiredParamError('identifier');
  if (!ns) throw createRequiredParamError('namespace');

  // Ensure keys are sorted
  const namespace = Object.keys(ns)
    .sort((a, b) => a.localeCompare(b))
    .reduce((o, k) => ({ ...o, [k]: ns[k] }), {});
  const user = await AppUser.findOne({
    applicationId,
    externalIds: {
      $elemMatch: {
        'identifier.value': identifier.value,
        namespace,
      },
    },
  });
  return user || null;
};
