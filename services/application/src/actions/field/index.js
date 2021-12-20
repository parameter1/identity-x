const {
  findById,
  listForApp,
  matchForApp,
} = require('@identity-x/utils').actions;
const { createParamError } = require('@base-cms/micro').service;
const create = require('./create');
const updateOne = require('./update-one');
const userSelectAnswers = require('./user-select-answers');

const Field = require('../../mongodb/models/field');
const SelectField = require('../../mongodb/models/field/select');
const BooleanField = require('../../mongodb/models/field/boolean');

module.exports = {
  create,
  findById: ({ id, type, fields }) => {
    const supportedTypes = ['select', 'boolean'];
    if (!supportedTypes.includes(type)) throw createParamError('type', type, supportedTypes);
    switch (type) {
      case 'boolean':
        return findById(BooleanField, { id, fields });
      default:
        return findById(SelectField, { id, fields });
    }
  },
  listForApp: params => listForApp(Field, params),
  matchForApp: params => matchForApp(Field, params),
  updateOne,
  userSelectAnswers,
};
