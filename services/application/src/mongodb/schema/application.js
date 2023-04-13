const { Schema } = require('mongoose');
const { organizationPlugin } = require('@identity-x/mongoose-plugins');
const { normalizeEmail } = require('@identity-x/utils');
const { emailValidator } = require('@identity-x/mongoose-plugins');

const contextSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    set: normalizeEmail,
    validate: emailValidator,
  },
  description: {
    type: String,
    trim: true,
  },
  language: {
    type: String,
    default: 'en-us',
    enum: ['en-us', 'es-mx'],
  },
});

const schema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    set: normalizeEmail,
    validate: emailValidator,
  },
  description: {
    type: String,
    trim: true,
  },
  language: {
    type: String,
    default: 'en-us',
    enum: ['en-us', 'es-mx'],
  },
  contexts: {
    type: [contextSchema],
  },
}, { timestamps: true });

schema.plugin(organizationPlugin);

module.exports = schema;
