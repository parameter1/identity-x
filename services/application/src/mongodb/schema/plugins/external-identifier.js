const { Schema } = require('mongoose');

const externalIdentifierSchema = new Schema({
  _id: false,
  value: {
    type: String,
    required: true,
  },
  type: {
    type: String,
  },
});

const externalNamespaceSchema = new Schema({
  _id: false,
  provider: {
    type: String,
  },
  tenant: {
    type: String,
  },
  type: {
    type: String,
    required: true,
  },
});

const externalIdSchema = new Schema({
  _id: {
    type: String,
    required: true,
  },
  identifier: {
    type: externalIdentifierSchema,
    required: true,
  },
  namespace: {
    type: externalNamespaceSchema,
    required: true,
  },
});

module.exports = function externalIdentifierPlugin(schema, { fieldName = 'externalIds', multi = true } = {}) {
  schema.add({
    [fieldName]: {
      type: multi ? [externalIdSchema] : externalIdSchema,
      default: () => (multi ? [] : null),
    },
  });
};
