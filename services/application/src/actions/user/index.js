const {
  updateField,
  listForApp,
  matchForApp,
  findById,
  findByIdForApp,
  updateFieldWithApp,
} = require('@identity-x/utils').actions;
const { createRequiredParamError } = require('@base-cms/micro').service;
const changeEmail = require('./change-email');
const create = require('./create');
const deleteForApp = require('./delete-for-app');
const deleteForOrg = require('./delete-for-org');
const externalId = require('./external-id');
const findByEmail = require('./find-by-email');
const findByExternalIdForApp = require('./find-by-external-id');
const impersonate = require('./impersonate');
const login = require('./login');
const logout = require('./logout');
const manageCreate = require('./manage-create');
const regionalConsentAnswer = require('./regional-constent-answer');
const sendChangeEmailLink = require('./send-change-email-link');
const sendLoginLink = require('./send-login-link');
const setUnverifiedData = require('./set-unverified-data');
const updateCustomAttributes = require('./update-custom-attributes');
const updateCustomBooleanAnswers = require('./update-custom-boolean-answers');
const updateCustomSelectAnswers = require('./update-custom-select-answers');
const updateCustomTextAnswers = require('./update-custom-text-answers');
const updateOne = require('./update-one');
const verifyAuth = require('./verify-auth');

const AppUser = require('../../mongodb/models/app-user');

module.exports = {
  changeEmail,
  create,
  deleteForApp,
  deleteForOrg,
  externalId,
  findByEmail,
  findById: params => findById(AppUser, params),
  findByIdForApp: params => findByIdForApp(AppUser, params),
  findByExternalIdForApp,
  listForApp: params => listForApp(AppUser, params),
  impersonate,
  login,
  logout,
  manageCreate,
  matchForApp: params => matchForApp(AppUser, params),
  regionalConsentAnswer,
  sendChangeEmailLink,
  sendLoginLink,
  setUnverifiedData,
  updateField: params => updateField(AppUser, params),
  updateFieldWithApp: params => updateFieldWithApp(AppUser, params),
  updateCustomAttributes,
  updateCustomBooleanAnswers,
  updateCustomSelectAnswers,
  updateCustomTextAnswers,
  updateOne,
  verifyAuth,
  setLastSeen: async ({ id }) => {
    if (!id) throw createRequiredParamError('id');
    const doc = await AppUser.findById(id);
    if (!doc) {
      const err = new Error(`No user found for ID ${id}.`);
      err.statusCode = 404;
      throw err;
    }
    doc.set('lastSeen', new Date());
    return doc.save();
  },
};
