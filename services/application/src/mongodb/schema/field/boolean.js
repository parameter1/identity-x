const { Schema } = require('mongoose');

const type = {
  type: String,
  enum: ['STRING', 'NUMBER', 'BOOLEAN'],
  default: 'BOOLEAN',
};

module.exports = new Schema({
  whenTrue: {
    type: new Schema({
      value: { type: String, default: 'true' },
      type,
    }, { _id: false }),
    default: () => ({}),
  },
  whenFalse: {
    type: new Schema({
      value: { type: String, default: 'false' },
      type,
    }, { _id: false }),
    default: () => ({}),
  },
});
