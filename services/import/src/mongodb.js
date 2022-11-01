const Client = require('@parameter1/mongodb/client');
const { MONGO_DSN } = require('./env');

module.exports = new Client({ url: MONGO_DSN });
