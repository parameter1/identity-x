const { Schema } = require('mongoose');

const optionSchema = new Schema({
  /**
   * The option label. This is value the user will see.
   */
  label: {
    type: String,
    required: true,
    trim: true,
  },

  /**
   * The option index number. Used for sorting.
   */
  index: {
    type: Number,
    default: 0,
  },

  /**
   * An external identifier value to use when an external ID/namespace is present on the question.
   */
  externalIdentifier: {
    type: String,
    trim: true,
    default: null,
  },

  /**
   * Whether or not the option supports a write-in (free-form text) value
   */
  canWriteIn: {
    type: Boolean,
    default: false,
  },

  /**
   * Whether or not the option is allowed to be selected
   */
  selectableAnswer: {
    type: Boolean,
    default: true,
  },
});

const groupSchema = new Schema({
  /**
   * The group label. This is value the user will see.
   */
  label: {
    type: String,
    required: true,
    trim: true,
  },

  /**
   * The option index number. Used for sorting.
   */
  index: {
    type: Number,
    default: 0,
  },

  /**
   * The select options.
   */
  optionIds: {
    type: [Schema.Types.ObjectId],
    default: () => [],
  },
});

const schema = new Schema({
  /**
   * Whether this select field supports multiple answers.
   */
  multiple: {
    type: Boolean,
    default: false,
  },

  /**
   * The select options.
   */
  options: {
    type: [optionSchema],
    default: () => [],
  },

  /**
   * The select groups.
   */
  groups: {
    type: [groupSchema],
    default: () => [],
  },
});

module.exports = schema;
