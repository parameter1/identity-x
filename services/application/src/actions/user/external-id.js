const { createError } = require('micro');
const { createRequiredParamError } = require('@base-cms/micro').service;
const { isObject } = require('@base-cms/utils');
const AppUser = require('../../mongodb/models/app-user');
const EntityID = require('../../entity-id/id');

const pushId = (user, externalId) => {
  const id = externalId.toString();
  user.externalIds.push({
    _id: id,
    identifier: externalId.identifier,
    namespace: externalId.namespace,
  });
};

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
    const nsIdentifier = externalId.toNamespaceIdentifier();

    const hasExistingExternalIds = Boolean(user.externalIds.length);
    if (!hasExistingExternalIds) {
      pushId(user, externalId);
      return user.save();
    }

    const alreadyHasExternalId = user.externalIds.some(({ _id }) => _id === id);
    if (alreadyHasExternalId) return user;

    const currentExternalIdWithSameNamespace = user.externalIds.find((doc) => {
      const eid = new EntityID(doc.identifier, doc.namespace);
      const currentNsIdentifier = eid.toNamespaceIdentifier();
      return currentNsIdentifier === nsIdentifier;
    });
    if (!currentExternalIdWithSameNamespace) {
      pushId(user, externalId);
      return user.save();
    }
    // remove the old ID and replace with the new.
    user.externalIds.pull({ _id: currentExternalIdWithSameNamespace._id });
    pushId(user, externalId);
    return user.save();
  },
};
