const {
  cleanEnv,
  validators,
  bool,
  port,
} = require('@base-cms/env');

const { nonemptystr } = validators;

module.exports = cleanEnv(process.env, {
  EXTERNAL_PORT: port({ desc: 'The external port that the service is exposed on.', default: 80 }),
  INTERNAL_PORT: port({ desc: 'The internal port that the service will run on.', default: 80 }),
  MONGO_DSN: nonemptystr({ desc: 'The MongoDB DSN to connect to.' }),
  NEW_RELIC_ENABLED: bool({ desc: 'Whether New Relic is enabled.', default: true, devDefault: false }),
  NEW_RELIC_LICENSE_KEY: nonemptystr({ desc: 'The license key for New Relic.', devDefault: '(unset)' }),
  SENDING_DOMAIN: nonemptystr({ desc: 'The domain emails will be sent from.', default: 'identity-x.parameter1.com' }),
  SUPPORT_EMAIL: nonemptystr({ desc: 'The support email address.', default: 'support@parameter1.com' }),
  SUPPORT_ENTITY: nonemptystr({ desc: 'The contact info for the supporting entity.', default: 'Parameter1 LLC, 47 S Water St E, Fort Atkinson, WI 53551' }),
});
