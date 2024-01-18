const { createError } = require('micro');
const { createRequiredParamError } = require('@base-cms/micro').service;
const { handleError } = require('@identity-x/utils').mongoose;
// const { Schema: { Types: { ObjectId } } } = require('mongoose');
const { ObjectId } = require('mongodb');
const { Application, AppUser, Segment } = require('../../mongodb/models');

/**
 * Without transaction support in 3.6, run this as if it's in a two-phase commit
 * @see https://www.mongodb.com/docs/v3.6/tutorial/perform-two-phase-commits/
 */
module.exports = async ({ segmentId } = {}) => {
  if (!segmentId) throw createRequiredParamError('segmentId');

  const segment = await Segment.findById(segmentId, ['id', 'applicationId', 'rules']);
  if (!segment) throw createError(404, `No segment was found for '${segmentId}'`);

  const { applicationId, rules } = segment;

  const application = await Application.findById(applicationId, ['id']);
  if (!application) throw createError(404, `No application was found for '${applicationId}'`);

  try {
    const sid = new ObjectId(segmentId);
    // Remove all existing memberships for this segment
    await AppUser.collection.bulkWrite([{
      updateMany: {
        filter: { applicationId, segments: sid },
        update: { $pull: { segments: sid } },
      },
    }]);

    // Generate update ops from rules
    const $or = rules.reduce((arr, rule) => {
      const conditions = Array.isArray(rule.conditions) ? [...rule.conditions] : [];
      return [
        ...arr,
        ...conditions.map(({ field, answer }) => ({
          customSelectFieldAnswers: {
            $elemMatch: {
              _id: new ObjectId(field),
              values: new ObjectId(answer),
            },
          },
        })),
      ];
    }, []);
    if ($or.length) {
      const { modifiedCount } = await AppUser.collection.bulkWrite([{
        updateMany: {
          filter: { applicationId, $or },
          update: { $addToSet: { segments: sid } },
        },
      }]);
      console.log(modifiedCount);
      return {
        status: 'ok',
        updated: modifiedCount,
        rules: $or.length,
      };
    }
    return {
      status: 'ok',
      updated: 0,
      rules: $or.length,
    };
  } catch (e) {
    throw handleError(createError, e);
  }
};
