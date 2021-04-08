const { updateForId } = require('@identity-x/utils').actions;

const Organization = require('../mongodb/models/organization');
const create = require('./create');
const findById = require('./find-by-id');
const regionalConsentPolicy = require('./regional-constent-policy');
const updateCompanyInfo = require('./update-company-info');
const updateField = require('./update-field');

module.exports = {
  create,
  findById,
  regionalConsentPolicy,
  updateCompanyInfo,
  updateField,
  updateForId: (params) => updateForId(Organization, params),
};
