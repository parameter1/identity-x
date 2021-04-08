const {
  findById,
  find,
  listForApp,
  matchForApp,
} = require('@identity-x/utils').actions;
const create = require('./create');
const updateOne = require('./update-one');
const AccessLevel = require('../../mongodb/models/access-level');

module.exports = {
  create,
  find: ({ query, fields }) => find(AccessLevel, { query, fields }),
  findById: ({ id, fields }) => findById(AccessLevel, { id, fields }),
  listForApp: (params) => listForApp(AccessLevel, params),
  matchForApp: (params) => matchForApp(AccessLevel, params),
  updateOne,
};
