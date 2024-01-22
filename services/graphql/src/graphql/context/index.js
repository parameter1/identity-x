const applicationContext = require('./application');
const orgContext = require('./organization');
const userContext = require('./user');

/**
 * @typedef GraphQLServerContext
 * @prop {ApplicationContext} app
 * @prop {OrganizationContext} org
 * @prop {UserContext} user
 *
 * @param {Object} o
 * @param {import('express').Request} o.req
 * @returns {Promise<GraphQLServerContext>}
 * */
module.exports = async ({ req }) => {
  const [app, org, user] = await Promise.all([
    applicationContext(req.get('x-app-id')),
    orgContext(req.get('x-org-id')),
    userContext(req.get('authorization')),
  ]);
  return {
    app,
    org,
    user,
    req,
  };
};
