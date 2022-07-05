const Field = require('./index');
const schema = require('../../schema/field/text');

module.exports = Field.discriminator('field-text', schema, 'text');
