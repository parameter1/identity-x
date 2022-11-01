const { log } = console;

module.exports = async (records = [], applicationId, limit = 10) => {
  log('Upserting ', records.length, applicationId, limit);
};
