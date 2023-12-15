const {
  findById,
  find,
  listForApp,
  matchForApp,
} = require('@identity-x/utils').actions;
const create = require('./create');
const updateOne = require('./update-one');
const Cohort = require('../../mongodb/models/cohort');

module.exports = {
  create,
  find: ({ query, fields }) => find(Cohort, { query, fields }),
  findById: ({ id, fields }) => findById(Cohort, { id, fields }),
  listForApp: params => listForApp(Cohort, params),
  matchForApp: params => matchForApp(Cohort, params),
  updateOne,
};
