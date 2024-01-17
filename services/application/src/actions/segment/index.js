const {
  findById,
  find,
  listForApp,
  matchForApp,
} = require('@identity-x/utils').actions;
const create = require('./create');
const fieldsByIds = require('./fields-by-ids');
const updateOne = require('./update-one');
const Segment = require('../../mongodb/models/segment');
const Field = require('../../mongodb/models/field');

module.exports = {
  create,
  find: ({ query, fields }) => find(Segment, { query, fields }),
  findById: ({ id, fields }) => findById(Segment, { id, fields }),
  fieldsByIds: ({ ids, fields }) => fieldsByIds(Field, { ids, fields }),
  listForApp: params => listForApp(Segment, params),
  matchForApp: params => matchForApp(Segment, params),
  updateOne,
};
