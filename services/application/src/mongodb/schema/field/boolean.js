const { Schema } = require('mongoose');

const { Mixed } = Schema.Types;

const type = {
  type: String,
  enum: ['STRING', 'INTEGER', 'BOOLEAN', 'FLOAT'],
  default: 'BOOLEAN',
};

const bools = { false: new Set(['0', 'false']), true: new Set(['1', 'true']) };

const cast = (t, v) => {
  switch (t) {
    case 'INTEGER':
      return parseInt(v, 10) || 0;
    case 'FLOAT':
      return parseFloat(v) || 0;
    case 'STRING':
      return `${v}`;
    default:
      if (bools.true.has(v)) return true;
      if (bools.false.has(v)) return false;
      return Boolean(v);
  }
};

const value = {
  type: Mixed,
  get(v) {
    return cast(this.type, v);
  },
  set(v) {
    this.markModified('value');
    return cast(this.type, v);
  },
};

module.exports = new Schema({
  whenTrue: {
    type: new Schema({
      value: { ...value, default: true },
      type,
    }, { _id: false }),
    default: () => ({}),
  },
  whenFalse: {
    type: new Schema({
      value: { ...value, default: false },
      type,
    }, { _id: false }),
    default: () => ({}),
  },
});
