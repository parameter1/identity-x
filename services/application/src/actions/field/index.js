const {
  findById,
  listForApp,
  matchForApp,
} = require('@identity-x/utils').actions;
const { createParamError } = require('@base-cms/micro').service;
const create = require('./create');
const updateOne = require('./update-one');
const userBooleanAnswers = require('./user-boolean-answers');
const userSelectAnswers = require('./user-select-answers');
const userTextAnswers = require('./user-text-answers');

const Field = require('../../mongodb/models/field');
const SelectField = require('../../mongodb/models/field/select');
const BooleanField = require('../../mongodb/models/field/boolean');
const TextField = require('../../mongodb/models/field/text');

module.exports = {
  create,
  findById: ({ id, type, fields }) => {
    const supportedTypes = ['select', 'boolean', 'text'];
    if (!supportedTypes.includes(type)) throw createParamError('type', type, supportedTypes);
    switch (type) {
      case 'boolean':
        return findById(BooleanField, { id, fields });
      case 'select':
        return findById(SelectField, { id, fields });
      default:
        return findById(TextField, { id, fields });
    }
  },
  listForApp: params => listForApp(Field, params),
  matchForApp: params => matchForApp(Field, params),
  updateOne,
  userBooleanAnswers,
  userSelectAnswers,
  userTextAnswers,
};
