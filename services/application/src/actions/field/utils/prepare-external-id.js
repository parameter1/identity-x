const EntityID = require('../../../entity-id/id');

module.exports = (eid) => {
  const hasExternalId = eid
    && eid.namespace && eid.namespace.type && eid.identifier && eid.identifier;
  if (!hasExternalId) return null;
  const externalId = new EntityID(eid.identifier, eid.namespace);
  return {
    _id: externalId.toString(),
    identifier: externalId.identifier,
    namespace: externalId.namespace,
  };
};
