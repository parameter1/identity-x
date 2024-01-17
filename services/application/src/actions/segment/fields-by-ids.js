const { createRequiredParamError } = require('@base-cms/micro').service;

/**
 * @param {import('mongoose/lib/document')} Model
 * @param {object} args
 * @param {string[]} args.ids
 * @param {string[]} args.fields
 * @returns {Model[]}
 */
module.exports = async (Model, { ids }) => {
  if (!ids) throw createRequiredParamError('ids');
  return Model.find({ _id: { $in: ids } }, {
    name: 1,
    'options._id': 1,
    'options.label': 1,
  });
};
