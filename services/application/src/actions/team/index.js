const {
  findById,
  find,
  listForApp,
  matchForApp,
} = require('@identity-x/utils').actions;
const create = require('./create');
const updateOne = require('./update-one');
const Team = require('../../mongodb/models/team');

module.exports = {
  create,
  find: ({ query, fields }) => find(Team, { query, fields }),
  findById: ({ id, fields }) => findById(Team, { id, fields }),
  listForApp: (params) => listForApp(Team, params),
  matchForApp: (params) => matchForApp(Team, params),
  updateOne,
};
