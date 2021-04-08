const { Schema } = require('mongoose');
const { domainValidator, applicationPlugin } = require('@identity-x/mongoose-plugins');
const { ipService } = require('@identity-x/service-clients');
const accessLevelPlugin = require('./plugins/access-level');

const cidrSchema = new Schema({
  value: {
    type: String,
    required: true,
    validate: {
      validator: (address) => ipService.request('validate', { address }),
      message: 'Invalid IP Address or CIDR notation {VALUE}',
    },
  },
  min: Buffer,
  max: Buffer,
});

cidrSchema.pre('save', async function setCIDRValues() {
  const cidr = await ipService.request('cidr', { address: this.value });
  const { min, max } = await ipService.request('range', { cidr });
  this.min = Buffer.from(min, 'hex');
  this.max = Buffer.from(max, 'hex');
});

const schema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  active: {
    type: Boolean,
    default: true,
  },
  description: {
    type: String,
    trim: true,
  },
  cidrs: {
    type: [cidrSchema],
    default: () => [],
  },
  domains: {
    type: [String],
    validate: domainValidator,
    default: () => [],
  },
  photoURL: String,
}, { timestamps: true });

schema.plugin(applicationPlugin, { collateWhen: ['name'] });
schema.plugin(accessLevelPlugin);

schema.index({
  applicationId: 1,
  active: 1,
  'cidrs.min': 1,
  'cidrs.max': 1,
});
schema.index({ name: 1, _id: 1 }, { collation: { locale: 'en_US' } });
schema.index({ updatedAt: 1, _id: 1 });
schema.index({ createdAt: 1, _id: 1 });

module.exports = schema;
