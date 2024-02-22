const { Types } = require('mongoose');
const { tokenService } = require('@identity-x/service-clients');
const { service } = require('@base-cms/micro');
const models = require('../../mongodb/models');

const { Application } = models;

const { ObjectId } = Types;

const { createRequiredParamError } = service;

module.exports = async ({
  applicationId,
  email,
  userId,
} = {}) => {
  if (!applicationId) throw createRequiredParamError('applicationId');
  if (!email && !userId) throw createdRequiredParamError('email XOR userId');

  const pipeline = [
    { $match: { _id: new ObjectId(applicationId) } },
    { $group: { _id: null, appIds: { $push: '$_id' } } },
    {
      $lookup: {
        from: 'app-users',
        let: { appIds: '$appIds' },
        as: 'appUser',
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  {
                    ...(email && { $eq: ['$email', email.toLowerCase()] }),
                    ...(userId && { $eq: ['$_id', new ObjectId(userId)] }),
                  },
                  { $in: ['$applicationId', '$$appIds'] },
                ],
              },
            },
          },
          { $project: { email: 1 } },
        ],
      },
    },
    { $unwind: '$appUser' },
    {
      $lookup: {
        from: 'comments',
        let: { appIds: '$appIds', appUserId: '$appUser._id' },
        as: 'comments',
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$appUserId', '$$appUserId'] },
                  { $in: ['$applicationId', '$$appIds'] },
                ],
              },
            },
          },
          { $project: { _id: 1 } },
        ],
      },
    },
    {
      $lookup: {
        from: 'app-user-logins',
        let: { appIds: '$appIds', email: '$appUser.email' },
        as: 'appUserLogins',
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$email', '$$email'] },
                  { $in: ['$applicationId', '$$appIds'] },
                ],
              },
            },
          },
          { $project: { _id: 1 } },
        ],
      },
    },
    {
      $lookup: {
        from: 'tokens',
        let: { email: '$appUser.email' },
        as: 'tokens',
        pipeline: [
          { $match: { $expr: { $eq: ['$payload.aud', '$$email'] } } },
          { $project: { _id: 1, iss: 1 } },
        ],
      },
    },
  ];

  const results = await Application.aggregate(pipeline);
  const [doc] = results;

  if (!doc) return false;
  const stringifiedAppIds = new Set(doc.appIds.map(id => `${id}`));
  const result = {
    ...doc,
    tokens: doc.tokens.filter(token => stringifiedAppIds.has(token.iss)),
  };

  const criterion = [
    ['AppUser', { applicationId: { $in: result.appIds }, email: result.appUser.email }],
    ['AppUserLogin', { _id: { $in: result.appUserLogins.map(login => login._id) } }],
    ['Comment', { _id: { $in: result.comments.map(comment => comment._id) } }],
  ];

  await Promise.all([
    Promise.all(criterion.map(async ([modelName, criteria]) => {
      const Model = models[modelName];
      await Model.deleteMany(criteria);
    })),
    (async () => {
      const jtis = result.tokens.map(token => token._id);
      if (!jtis.length) return;
      await Promise.all(jtis.map(jti => tokenService.request('invalidate', { jti })));
    })(),
  ]);

  return true;
};
