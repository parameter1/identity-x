const { createError } = require('micro');
const { createRequiredParamError } = require('@base-cms/micro').service;
const { isObject } = require('@base-cms/utils');
const AppUser = require('../../mongodb/models/app-user');
const EntityID = require('../../entity-id/id');

module.exports = {
  add: async ({
    applicationId,
    userId,
    identifier,
    namespace,
  } = {}) => {
    if (!applicationId) throw createRequiredParamError('applicationId');
    if (!userId) throw createRequiredParamError('userId');
    if (!isObject(identifier)) throw createRequiredParamError('identifier');
    if (!isObject(namespace)) throw createRequiredParamError('namespace');
    const user = await AppUser.findByIdForApp(userId, applicationId);
    if (!user) throw createError(404, `No user was found for '${userId}'`);

    const externalId = new EntityID(identifier, namespace);
    const id = externalId.toString();

    // external ID already set. do nothing and return user.
    if (user.externalIds.some(({ _id }) => _id === id)) return user;
    user.externalIds.push({
      _id: id,
      identifier: externalId.identifier,
      namespace: externalId.namespace,
    });
    return user.save();
  },
};
