const jwt = require('jsonwebtoken');
const { createRequiredParamError } = require('@base-cms/micro').service;
const { TOKEN_SECRET } = require('../env');

module.exports = async ({ payload } = {}) => {
  if (!payload) throw createRequiredParamError('payload');
  return jwt.sign(payload, TOKEN_SECRET);
};
