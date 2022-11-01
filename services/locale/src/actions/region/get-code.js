const { createRequiredParamError } = require('@base-cms/micro').service;
const regions = require('../../regions');

module.exports = ({ name, countryCode }) => {
  if (!countryCode) throw createRequiredParamError('countryCode');
  if (!name) throw createRequiredParamError('name');
  const options = regions[countryCode] || {};
  const found = Object.entries(options).find(([, obj]) => obj.name === name);
  if (found) {
    const [, { regionCode }] = found;
    return regionCode;
  }
  return false;
};
