const {
  updateField,
  listForApp,
  matchForApp,
  findById,
  updateFieldWithApp,
} = require('@identity-x/utils').actions;
const { createRequiredParamError } = require('@base-cms/micro').service;
const changeEmail = require('./change-email');
const create = require('./create');
const createIdentityToken = require('./create-identity-token');
const externalId = require('./external-id');
const findByEmail = require('./find-by-email');
const impersonate = require('./impersonate');
const login = require('./login');
const logout = require('./logout');
const manageCreate = require('./manage-create');
const regionalConsentAnswer = require('./regional-constent-answer');
const sendChangeEmailLink = require('./send-change-email-link');
const sendLoginLink = require('./send-login-link');
const setUnverifiedData = require('./set-unverified-data');
const updateCustomBooleanAnswers = require('./update-custom-boolean-answers');
const updateCustomSelectAnswers = require('./update-custom-select-answers');
const updateOne = require('./update-one');
const verifyAuth = require('./verify-auth');
const verifyIdentityToken = require('./verify-identity-token');

const AppUser = require('../../mongodb/models/app-user');

module.exports = {
  changeEmail,
  create,
  createIdentityToken,
  externalId,
  findByEmail,
  findById: params => findById(AppUser, params),
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
  updateCustomBooleanAnswers,
  updateCustomSelectAnswers,
  updateOne,
  verifyAuth,
  verifyIdentityToken,
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
