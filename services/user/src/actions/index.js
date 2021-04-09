const create = require('./create');
const createApiToken = require('./create-api-token');
const findByEmail = require('./find-by-email');
const login = require('./login');
const logout = require('./logout');
const sendLoginLink = require('./send-login-link');
const update = require('./update');
const verifyApiToken = require('./verify-api-token');
const verifyAuth = require('./verify-auth');

module.exports = {
  create,
  createApiToken,
  findByEmail,
  login,
  logout,
  sendLoginLink,
  update,
  verifyApiToken,
  verifyAuth,
};
