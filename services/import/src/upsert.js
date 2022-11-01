const { ObjectId } = require('@parameter1/mongodb');
const batch = require('./batch');
const client = require('./mongodb');

const { log } = console;
const now = new Date();

module.exports = async (records = [], appId, limit = 10) => {
  log('Upserting ', records.length, appId, limit);

  const applicationId = new ObjectId(appId);
  const collection = await client.collection({ dbName: 'identity-x', name: 'app-users' });

  await batch({
    name: 'upsert',
    totalCount: records.length,
    limit,
    retriever: ({ skip }) => records.slice(skip, skip + limit),
    handler: async ({ results }) => {
      const ops = results.reduce((arr, user) => {
        const {
          _id,
          email,
          verified,
          externalId,
          customBooleanFieldAnswers,
          ...payload
        } = user;
        const insertDefaults = {
          verified,
          customBooleanFieldAnswers,
        };
        const filter = { applicationId, email, ...(_id && { _id }) };
        const $addToSet = {
          ...(externalId && { externalIds: externalId }),
        };
        return [
          ...arr,
          {
            // Upsert the user
            updateOne: {
              filter,
              update: {
                ...(Object.keys($addToSet).length && { $addToSet }),
                $setOnInsert: { ...insertDefaults, ...filter, _importedAt: now },
                $set: { ...payload, _updatedAt: now },
              },
              upsert: !_id,
            },
          },
          {
            // Set the boolean answers if they haven't already been set in IdentityX
            updateOne: {
              filter: {
                applicationId,
                email,
                'customBooleanFieldAnswers.0': { $exists: false },
              },
              update: { $set: { customBooleanFieldAnswers } },
            },
          },
        ];
      }, []);
      return collection.bulkWrite(ops);
    },
  });

  return client.close();
};
