const {
  updateField,
  listForApp,
  matchForApp,
  findById,
  updateFieldWithApp,
} = require('@identity-x/utils').actions;
const create = require('./create');
const findByEmail = require('./find-by-email');
const login = require('./login');
const logout = require('./logout');
const manageCreate = require('./manage-create');
const sendLoginLink = require('./send-login-link');
const updateOne = require('./update-one');
const verifyAuth = require('./verify-auth');

const AppUser = require('../../mongodb/models/app-user');

module.exports = {
  create,
  findByEmail,
  findById: params => findById(AppUser, params),
  listForApp: params => listForApp(AppUser, params),
  login,
  logout,
  manageCreate,
  matchForApp: params => matchForApp(AppUser, params),
  sendLoginLink,
  updateField: params => updateField(AppUser, params),
  updateFieldWithApp: params => updateFieldWithApp(AppUser, params),
  updateOne,
  verifyAuth,
};
