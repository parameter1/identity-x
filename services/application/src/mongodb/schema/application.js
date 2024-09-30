const { Schema } = require('mongoose');
const stripTags = require('striptags');
const { organizationPlugin } = require('@identity-x/mongoose-plugins');
const { normalizeEmail } = require('@identity-x/utils');
const { emailValidator } = require('@identity-x/mongoose-plugins');

const stripHtml = (v) => {
  if (!v) return null;
  return stripTags(v, ['b', 'strong', 'em', 'i', 'u', 'p', 'br']);
};

const loginLinkTemplate = new Schema({
  subject: {
    type: String,
    trim: true,
    set: stripHtml,
  },
  unverifiedVerbiage: {
    type: String,
    trim: true,
    set: stripHtml,
  },
  verifiedVerbiage: {
    type: String,
    trim: true,
    set: stripHtml,
  },
  loginLinkStyle: {
    type: String,
    trim: true,
    set: stripHtml,
  },
  loginLinkText: {
    type: String,
    trim: true,
    set: stripHtml,
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
