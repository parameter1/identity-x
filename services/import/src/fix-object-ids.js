const { ObjectId } = require('@parameter1/mongodb');
const { iterateCursor } = require('@parameter1/mongodb/utils');

const batch = require('./batch');
const client = require('./mongodb');

module.exports = async (appId, limit = 10) => {
  const applicationId = new ObjectId(appId);
  const collection = await client.collection({ dbName: 'identity-x', name: 'app-users' });
  const projection = { customBooleanFieldAnswers: 1, customSelectFieldAnswers: 1 };
  const query = {
    applicationId,
    $or: [
      { 'customBooleanFieldAnswers.0._id': { $type: 'string' } },
      { 'customSelectFieldAnswers.0._id': { $type: 'string' } },
    ],
  };

  await batch({
    name: 'fix-ids',
    totalCount: await collection.countDocuments(query),
    limit,
    // Explicitly skipping `sort` since we're modifying what we're querying against!
    retriever: () => collection.find(query, { limit, projection }),
    handler: async ({ results }) => {
      const ops = [];
      await iterateCursor(results, async (user) => {
        ops.push({
          updateOne: {
            filter: { _id: user._id },
            update: {
              $set: {
                customBooleanFieldAnswers: user.customBooleanFieldAnswers.map(({ _id, value }) => ({
                  _id: new ObjectId(_id),
                  value,
                })),
                customSelectFieldAnswers: user.customSelectFieldAnswers.map(({ _id, values }) => ({
                  _id: new ObjectId(_id),
                  values: (values || []).map(id => new ObjectId(id)),
                })),
              },
            },
          },
        });
      });
      return collection.bulkWrite(ops);
    },
  });

  return client.close();
};
