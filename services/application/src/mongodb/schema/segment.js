const { Schema } = require('mongoose');
const { applicationPlugin } = require('@identity-x/mongoose-plugins');

const conditionSchema = new Schema({
  field: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  answer: {
    type: Schema.Types.ObjectId,
    required: true,
  },
});

const ruleSchema = new Schema({
  conditions: {
    type: [conditionSchema],
    required: true,
  },
});

const schema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  appContextId: {
    type: Schema.Types.ObjectId,
    index: true,
    required: false,
  },
  active: {
    type: Boolean,
    default: true,
  },
  description: {
    type: String,
    trim: true,
  },
  rules: {
    type: [ruleSchema],
    default: () => [],
  },
}, { timestamps: true });

schema.plugin(applicationPlugin, { collateWhen: ['name'] });

schema.index({
  applicationId: 1,
  active: 1,
});
schema.index({ name: 1, _id: 1 }, { collation: { locale: 'en_US' } });
schema.index({ updatedAt: 1, _id: 1 });
schema.index({ createdAt: 1, _id: 1 });

module.exports = schema;
