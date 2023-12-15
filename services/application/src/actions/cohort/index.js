const {
  findById,
  find,
  listForApp,
  matchForApp,
} = require('@identity-x/utils').actions;
const create = require('./create');
const fieldsByIds = require('./fields-by-ids');
const updateOne = require('./update-one');
const Cohort = require('../../mongodb/models/cohort');
const Field = require('../../mongodb/models/field');

module.exports = {
  create,
  find: ({ query, fields }) => find(Cohort, { query, fields }),
  findById: ({ id, fields }) => findById(Cohort, { id, fields }),
  fieldsByIds: ({ ids, fields }) => fieldsByIds(Field, { ids, fields }),
  listForApp: params => listForApp(Cohort, params),
  matchForApp: params => matchForApp(Cohort, params),
  updateOne,
};
