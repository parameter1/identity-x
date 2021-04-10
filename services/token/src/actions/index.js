const Token = require('../mongodb/models/token');
const create = require('./create');
const invalidate = require('./invalidate');
const sign = require('./sign');
const verify = require('./verify');

module.exports = {
  create,
  findOne: ({ query, fields }) => Token.findOne(query, fields),
  invalidate,
  sign,
  verify,
};
