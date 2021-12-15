const Field = require('./index');
const schema = require('../../schema/field/boolean');

module.exports = Field.discriminator('field-boolean', schema, 'boolean');
