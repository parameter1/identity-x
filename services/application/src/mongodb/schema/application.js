const { Schema } = require('mongoose');
const stripTags = require('striptags');
const { organizationPlugin } = require('@identity-x/mongoose-plugins');
const { normalizeEmail } = require('@identity-x/utils');
const { emailValidator } = require('@identity-x/mongoose-plugins');

const stripHtml = (v) => {
  if (!v) return null;
  return stripTags(v, ['em', 'i', 'b']);
};

const loginLinkTemplate = new Schema({
  subjectLine: {
    type: String,
    set: (v) => {
      if (!v) return null;
      return stripHtml(v);
    },
  },
  unverifiedVerbiage: {
    type: String,
    set: (v) => {
      if (!v) return null;
      return stripHtml(v);
    },
  },
  verifiedVerbiage: {
    type: String,
    set: (v) => {
      if (!v) return null;
      return stripHtml(v);
    },
  },
});

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
  loginLinkTemplate: { type: loginLinkTemplate, get: v => (v || {}) },
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
  loginLinkTemplate: { type: loginLinkTemplate, get: v => (v || {}) },
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
