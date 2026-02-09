const { UserInputError } = require('apollo-server-express');
const { get } = require('object-path');
const { applicationService, organizationService } = require('@identity-x/service-clients');
const { DISABLED_MINDFUL_TENANT_KEYS } = require('../../env');

const disabledMinfulKeys = new Set((DISABLED_MINDFUL_TENANT_KEYS || '').split(',').map(v => v.trim()).filter(v => v));

const appIdsToMindfulKeys = new Map([
  ['6154db20fa82c60da670be4b', 'abmedia'],
  ['6154db3afa82c6420870be4c', 'abmedia'],
  ['6154db4dfa82c643bb70be4d', 'abmedia'],
  ['607749ac1d04bcbdb37a3227', 'allured'],
  ['60774a653dac592b7d3ae11e', 'allured'],
  ['60774a9b3dac592ac33ae11f', 'allured'],
  ['60774ac41d04bc3a057a3228', 'allured'],
  ['60774dbe3dac5936323ae121', 'allured'],
  ['60774de13dac5942693ae122', 'allured'],
  ['60774e0b1d04bc6fb77a322b', 'allured'],
  ['60774e251d04bc6f977a322c', 'allured'],
  ['646e415a14b089797ec24971', 'ascend'],
  ['66183c5e0635be32a6f07115', 'datia'],
  ['60b7b2bd1245f46d03e69e1d', 'cma'],
  ['66c4cfd71a5e8dd2b0608e5f', 'encore360'],
  ['6978c952cfa8ef747e3ee748', 'encore360'],
  ['5f77a17b8eebee8cabee53fb', 'fusable'],
  ['5f77a19d8eebee8244ee53fc', 'fusable'],
  ['5f77a1ac0f883d18cbe63efe', 'fusable'],
  ['5f77a1b98eebeee1c3ee53fd', 'fusable'],
  ['5f77a1c80f883d979ae63eff', 'fusable'],
  ['5f77a1e10f883d280fe63f00', 'randall-reilly'],
  ['650465135269f6714f6bcdf9', 'fusable'],
  ['5e28a3dd58e67b229e55ae43', 'im'],
  ['5e28a2c558e67b89b255ae3a', 'ironmarkets'],
  ['5e28a2d858e67b162e55ae3b', 'ironmarkets'],
  ['5e28a2eb58e67b3a7055ae3c', 'ironmarkets'],
  ['5e28a32058e67b0e9455ae3e', 'ironmarkets'],
  ['5e28a33658e67bda3655ae3f', 'ironmarkets'],
  ['661564bda370d83993649ffc', 'ironmarkets'],
  ['690fd02e6963a68295965461', 'lbm'],
  ['6744d45348f49e8a80e55173', 'media-matters'],
  ['68e7f34176a59f1e5f5d3ac4', 'media-matters'],
  ['67a1292d4c22af7f616ba743', 'parameter1'],
  ['5e28a49458e67b68f255ae49', 'pmmi'],
  ['5e28a4a058e67b7fad55ae4a', 'pmmi'],
  ['5e28a4ad58e67b166155ae4b', 'pmmi'],
  ['5e28a4ba58e67b867055ae4c', 'pmmi'],
  ['5e28a4c858e67b86c955ae4d', 'pmmi'],
  ['649063f19a64332c8ec42eed', 'pmmi'],
  ['6499da19f70f36fef3aa008c', 'pmmi'],
  ['6176f26a1fa8d14997cc99f5', 'rmm'],
  ['629bac8439347cfce3861789', 'smg'],
  ['62a20ab439347c3abb862984', 'smg'],
  ['62a20ac739347c1810862985', 'smg'],
  ['66930ad34881292c648fc335', 'transpire'],
  ['6449537d36197792dcb5e367', 'watt'],
]);

class AppContext {
  constructor(id) {
    this.id = id;
    const key = appIdsToMindfulKeys.get(id);
    if (key && disabledMinfulKeys.has(key)) {
      throw new Error(`The IdentityX application ID "${id}" is disabled and must migrated to use the new Mindful API. Please contact support for more information.`);
    }

    this.app = {};
    this.org = {};
  }

  async load() {
    const { id } = this;
    if (id) {
      try {
        this.app = await applicationService.request('findById', { id }) || {};
        const orgId = this.getOrgId();
        if (orgId) this.org = await organizationService.request('findById', { id: orgId }) || {};
      } catch (e) {
        this.error = e;
      }
    }
  }

  errored() {
    if (this.error) return true;
    return false;
  }

  getId() {
    return this.get('_id');
  }

  getOrgId() {
    return this.get('organizationId');
  }

  get(path, def) {
    return get(this.app, path, def);
  }

  exists() {
    if (this.errored()) return false;
    if (this.getId() && this.getOrgId()) return true;
    return false;
  }

  check() {
    if (this.errored()) throw this.error;
    if (!this.exists()) throw new UserInputError('Unable to find an application for this request.');
    return true;
  }
}

module.exports = async (id) => {
  const context = new AppContext(id);
  await context.load();
  return context;
};
