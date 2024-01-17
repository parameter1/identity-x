const connection = require('../connection');
const schema = require('../schema/segment');

module.exports = connection.model('segment', schema);
