const { createRequiredParamError } = require('@base-cms/micro').service;
const Token = require('../mongodb/models/token');

module.exports = async ({ jti, ttl = 60 } = {}) => {
  if (!jti) throw createRequiredParamError('jti');
  if (ttl > 0) {
    const exp = Math.floor((new Date()).valueOf() / 1000) + ttl;
    const token = await Token.findById(jti);
    if (token && (!token.payload.exp || token.payload.exp > exp)) {
      return Token.updateOne({ _id: jti }, { $set: { 'payload.exp': exp } });
    }
  }
  await Token.deleteOne({ _id: jti });
  return 'ok';
};
