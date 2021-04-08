const GraphQLJSON = require('graphql-type-json');
const merge = require('lodash.merge');

const accessLevel = require('./access-level');
const appUser = require('./app-user');
const application = require('./application');
const comment = require('./comment');
const commentStream = require('./comment-stream');
const field = require('./field');
const locale = require('./locale');
const organization = require('./organization');
const team = require('./team');
const user = require('./user');
const { DateType, ObjectIDType } = require('../types');

module.exports = merge(
  accessLevel,
  appUser,
  application,
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
