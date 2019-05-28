const { createRequiredParamError } = require('@base-cms/micro').service;
const Token = require('../mongodb/models/token');

module.exports = async ({ jti } = {}) => {
  if (!jti) throw createRequiredParamError('jti');
  await Token.remove({ _id: jti });
  return 'ok';
};
