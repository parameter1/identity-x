const { GraphQLJSON, GraphQLJSONObject } = require('graphql-type-json');
const deepAssign = require('deep-assign');

const accessLevel = require('./access-level');
const appUser = require('./app-user');
const application = require('./application');
const segment = require('./segment');
const comment = require('./comment');
const commentStream = require('./comment-stream');
const field = require('./field');
const locale = require('./locale');
const organization = require('./organization');
const team = require('./team');
const user = require('./user');
const { DateType, ObjectIDType } = require('../types');

module.exports = deepAssign(
  accessLevel,
  appUser,
  application,
  segment,
  comment,
  commentStream,
  field,
  locale,
  organization,
  team,
  user,
  {
    /**
     * Custom scalar types.
     */
    Date: DateType,
    ObjectID: ObjectIDType,
    JSON: GraphQLJSON,
    JSONObject: GraphQLJSONObject,

    /**
     * Root queries.
     */
    Query: {
      /**
       *
       */
      ping: () => 'pong',
    },

    /**
     * Root mutations.
     */
    Mutation: {
      /**
       *
       */
      ping: () => 'pong',
    },
  },
);
