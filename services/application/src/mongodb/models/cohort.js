const connection = require('../connection');
const schema = require('../schema/cohort');

module.exports = connection.model('cohort', schema);
