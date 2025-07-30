const { applicationService, exportService, localeService } = require('@identity-x/service-clients');
const { UserInputError, AuthenticationError } = require('apollo-server-express');
const newrelic = require('../../newrelic');
const connectionProjection = require('../utils/connection-projection');
const typeProjection = require('../utils/type-projection');

/**
 * @typedef {import("graphql").GraphQLResolveInfo} GraphQLResolveInfo
 * @typedef {import("../context").GraphQLServerContext} GraphQLServerContext
 */

const { isArray } = Array;

module.exports = {
  AppContext: {
    application: (_, __, { app }) => applicationService.request('findById', { id: app.getId() }),
  },

  AppUserExternalEntityId: {
    id: entity => entity._id,
  },

  AppUser: {
    id: user => user._id,
    accessLevels: ({ accessLevelIds }) => {
      if (!isArray(accessLevelIds) || !accessLevelIds.length) return [];
      const query = { _id: { $in: accessLevelIds } };
      return applicationService.request('access-level.find', { query });
    },
    teams: ({ teamIds }) => {
      if (!isArray(teamIds) || !teamIds.length) return [];
      const query = { _id: { $in: teamIds } };
      return applicationService.request('team.find', { query });
    },
    country: ({ countryCode }) => {
      if (!countryCode) return null;
      return localeService.request('country.asObject', { code: countryCode });
    },
    region: ({ countryCode, regionCode }) => {
      if (!countryCode || !regionCode) return null;
      return localeService.request('region.asObject', { countryCode, regionCode });
    },
    name: ({ givenName, familyName }) => [givenName, familyName].filter(v => v).join(' '),

    regionalConsentAnswers: ({ regionalConsentAnswers }, _, { app }) => {
      const { regionalConsentPolicies } = app.org;
      const policyIds = regionalConsentPolicies.map(policy => policy._id);
      return regionalConsentAnswers.filter(answer => policyIds.includes(answer._id));
    },


    /**
     * @param {object} root
     * @param {object} variables
     * @param {GraphQLServerContext} _
     * @param {GraphQLResolveInfo} info
     */
    segments: (root, { input }, _, info) => {
      const { segments } = root;
      const { filterIds, pagination, sort } = input;
      const filter = (isArray(filterIds)) ? filterIds : [];
      const segmentIds = (segments || [])
        .filter(id => (filter.length ? filter.includes(id) : true));
      const fields = connectionProjection(info);
      return applicationService.request('segment.find', {
        query: { _id: { $in: segmentIds } },
        fields,
        sort,
        pagination,
      });
    },

    customAttributes: ({ customAttributes }) => customAttributes || {},

    customBooleanFieldAnswers: async ({ customBooleanFieldAnswers }, { input }, { app }) => {
      const {
        fieldIds,
        onlyAnswered,
        onlyActive,
        sort,
      } = input;
      const booleanFieldAnswers = await applicationService.request('field.userBooleanAnswers', {
        applicationId: app.getId(),
        fieldIds,
        customBooleanFieldAnswers,
        onlyAnswered,
        onlyActive,
        sort,
      });
      return booleanFieldAnswers;
    },

    customSelectFieldAnswers: async ({ customSelectFieldAnswers }, { input }, { app }) => {
      const {
        fieldIds,
        onlyAnswered,
        onlyActive,
        sort,
      } = input;
      const selectFieldAnswers = await applicationService.request('field.userSelectAnswers', {
        applicationId: app.getId(),
        fieldIds,
        customSelectFieldAnswers,
        onlyAnswered,
        onlyActive,
        sort,
      });
      return selectFieldAnswers.map((selectFieldAnswer) => {
        const { field, answers } = selectFieldAnswer;
        return {
          ...selectFieldAnswer,
          answers: answers.map(answer => ({
            field,
            // BC support
            ...answer.option,
            option: answer.option,
            writeInValue: answer.writeInValue,
          })),
        };
      });
    },

    customTextFieldAnswers: async ({ customTextFieldAnswers }, { input }, { app }) => {
      const {
        fieldIds,
        onlyAnswered,
        onlyActive,
        sort,
      } = input;
      const textFieldAnswers = await applicationService.request('field.userTextAnswers', {
        applicationId: app.getId(),
        fieldIds,
        customTextFieldAnswers,
        onlyAnswered,
        onlyActive,
        sort,
      });
      return textFieldAnswers;
    },

    mustReVerifyProfile: ({ forceProfileReVerification, profileLastVerifiedAt }, _, { app }) => {
      if (forceProfileReVerification) return true; // verify flag has been hard set.
      const { appUserAllowedStaleDays } = app.org;
      if (!appUserAllowedStaleDays) return false; // stale threshold not set
      if (!profileLastVerifiedAt) return true; // profile never verified

      const ms = appUserAllowedStaleDays * 24 * 60 * 60 * 1000;
      const mustBeAtLeast = new Date(Date.now() - ms);
      const lastVerified = new Date(profileLastVerifiedAt);
      return lastVerified < mustBeAtLeast;
    },
  },

  AppUserCustomBooleanFieldAnswer: {
    value: ({ field, answer }) => {
      if (answer == null) return null;
      if (answer) return field.whenTrue.value;
      return field.whenFalse.value;
    },
  },

  AppUserRegionalConsentAnswer: {
    id: answer => answer._id,
    policy: (answer, _, { app }) => {
      const { regionalConsentPolicies } = app.org;
      return regionalConsentPolicies.find(policy => policy._id === answer._id);
    },
  },

  Query: {
    /**
     *
     */
    activeAppContext: async (_, args, { user, app, req }) => {
      const applicationId = app.getId();
      const email = user.get('email');
      const { ip: ipAddress } = req;
      if (user.hasValidUser('AppUser') && applicationId !== user.getAppId()) {
        throw new UserInputError('The provided application context does not match the app for the user.');
      }
      const context = await applicationService.request('loadContext', { applicationId, email, ipAddress });
      // set last seen (do not await)
      if (context.user) applicationService.request('user.setLastSeen', { id: context.user._id });
      return context;
    },

    checkContentAccess: async (_, { input }, { user, app, req }) => {
      const applicationId = app.getId();
      const email = user.get('email');
      const { ip: ipAddress } = req;
      const { isEnabled, requiredAccessLevelIds } = input;
      if (user.hasValidUser('AppUser') && applicationId !== user.getAppId()) {
        throw new UserInputError('The provided application context does not match the app for the user.');
      }
      return applicationService.request('checkAccess', {
        applicationId,
        email,
        ipAddress,
        isEnabled,
        requiredAccessLevelIds,
      });
    },

    appUsers: (_, { input }, { app }, info) => {
      const id = app.getId();
      const { sort, pagination } = input;
      const fields = connectionProjection(info);
      return applicationService.request('user.listForApp', {
        id,
        sort,
        pagination,
        fields,
      });
    },
    /**
     *
     */
    activeAppUser: async (_, args, { user }) => {
      const email = user.get('email');
      const applicationId = user.getAppId();
      const userDoc = await applicationService.request('user.findByEmail', {
        applicationId,
        email,
      });
      applicationService.request('user.setLastSeen', { id: userDoc._id });
      return userDoc;
    },

    /**
     *
     */
    appUserById: (_, { input }, { app }, info) => {
      const { id } = input;
      const applicationId = app.getId();
      const fields = typeProjection(info);
      return applicationService.request('user.findByIdForApp', {
        applicationId,
        id,
        fields,
      });
    },

    /**
     *
     */
    appUserByExternalId: (_, { input }, { app }, info) => {
      const { identifier, namespace } = input;
      const applicationId = app.getId();
      const fields = typeProjection(info);
      return applicationService.request('user.findByExternalIdForApp', {
        applicationId,
        identifier,
        namespace,
        fields,
      });
    },

    /**
     * @todo This should be secured, otherwise anyone could guess by email
     */
    appUser: (_, { input }, { app }, info) => {
      const applicationId = app.getId();
      const { email } = input;
      const fields = typeProjection(info);
      return applicationService.request('user.findByEmail', {
        applicationId,
        email,
        fields,
      });
    },
    matchAppUsers: (_, { input }, { app }, info) => {
      const applicationId = app.getId();

      const fields = connectionProjection(info);
      const {
        field,
        phrase,
        position,
        pagination,
        sort,
        excludeIds,
      } = input;

      return applicationService.request('user.matchForApp', {
        applicationId,
        field,
        phrase,
        position,
        fields,
        pagination,
        sort,
        excludeIds,
      });
    },
  },

  Mutation: {
    /**
     *
     */
    addAppUserExternalId: (_, { input }, { app }) => {
      const applicationId = app.getId();
      const { userId, identifier, namespace } = input;
      return applicationService.request('user.externalId.add', {
        applicationId,
        userId,
        identifier,
        namespace,
      });
    },

    /**
     *
     */
    changeAppUserEmail: (_, { input }, { req, app }) => {
      const applicationId = app.getId();
      const { token } = input;
      const ua = req.get('user-agent');
      return applicationService.request('user.changeEmail', {
        applicationId,
        token,
        ip: req.ip,
        ua,
      });
    },

    /**
     *
     */
    createAppUser: (_, { input }, { app }) => {
      const applicationId = app.getId();
      const {
        email,
        givenName,
        familyName,
        organization,
        organizationTitle,
        countryCode,
        regionCode,
        postalCode,
        city,
        street,
        addressExtra,
        mobileNumber,
        phoneNumber,
      } = input;
      const payload = {
        givenName,
        familyName,
        organization,
        organizationTitle,
        countryCode,
        regionCode,
        postalCode,
        city,
        street,
        addressExtra,
        mobileNumber,
        phoneNumber,
      };
      return applicationService.request('user.create', {
        applicationId,
        email,
        payload,
      });
    },

    deleteAppUserForCurrentApplication: (_, { input }, { app }) => {
      const applicationId = app.getId();
      const { email, userId } = input;
      if (email && userId) {
        throw new UserInputError('email XOR (exclusive or) userId is permitted!');
      }
      if (!email && !userId) {
        throw new UserInputError('email XOR (exclusive or) userId is required!');
      }
      return applicationService.request('user.deleteForApp', {
        applicationId,
        email,
        userId,
      });
    },

    deleteAppUserForCurrentOrg: (_, { input }, { org }) => {
      const organizationId = org.getId();
      const { email } = input;
      return applicationService.request('user.deleteForOrg', {
        organizationId,
        email,
      });
    },

    /**
     *
     */
    forceProfileReVerificationAppUser: (_, { input }, { app }) => {
      const applicationId = app.getId();
      const { id } = input;

      return applicationService.request('user.updateOne', {
        id,
        applicationId,
        payload: {
          forceProfileReVerification: true,
        },
      });
    },

    /**
     *
     */
    exportAppUsers: (_, __, { app, user }) => {
      const applicationId = app.getId();
      const email = user.get('email');
      exportService.request('user.exportForApp', { applicationId, email })
        .catch(newrelic.noticeError.bind(newrelic));
      return 'ok';
    },

    manageCreateAppUser: (_, { input }, { app }) => {
      const applicationId = app.getId();
      const {
        email,
        givenName,
        familyName,
        accessLevelIds,
        teamIds,
        organization,
        organizationTitle,
        countryCode,
        regionCode,
        postalCode,
        city,
        street,
        addressExtra,
        mobileNumber,
        phoneNumber,
      } = input;
      const payload = {
        email,
        givenName,
        familyName,
        accessLevelIds,
        teamIds,
        organization,
        organizationTitle,
        countryCode,
        regionCode,
        postalCode,
        city,
        street,
        addressExtra,
        mobileNumber,
        phoneNumber,
      };
      return applicationService.request('user.manageCreate', {
        applicationId,
        payload,
      });
    },

    /**
     *
     */
    impersonateAppUser: async (_, { input }, { req, app, user }) => {
      const applicationId = app.getId();
      const orgUserId = user.getId();

      // re-verify request is authorized
      const authorized = await user.hasOrgRole(app.getOrgId(), ['Owner', 'Administrator']);
      if (!authorized) throw new AuthenticationError('The supplied user credentials cannot be used for impersonation.');

      const { id, verify } = input;
      const ua = req.get('user-agent');
      return applicationService.request('user.impersonate', {
        applicationId,
        orgUserId,
        id,
        verify,
        ip: req.ip,
        ua,
      });
    },

    /**
     *
     */
    loginAppUser: (_, { input }, { req, app }) => {
      const applicationId = app.getId();
      const { token } = input;
      const ua = req.get('user-agent');
      return applicationService.request('user.login', {
        applicationId,
        token,
        ip: req.ip,
        ua,
      });
    },

    /**
     *
     */
    logoutAppUser: (_, { input }, { app }) => {
      const applicationId = app.getId();
      const { token } = input;
      return applicationService.request('user.logout', {
        applicationId,
        token,
      });
    },

    /**
     *
     */
    logoutAppUserWithData: (_, { input }, { app }) => {
      const applicationId = app.getId();
      const { token } = input;
      return applicationService.request('user.logout', {
        applicationId,
        token,
        returnUser: true,
      });
    },

    /**
     *
     */
    sendOwnAppUserChangeEmailLink: (_, { input }, { app, user }) => {
      const applicationId = app.getId();
      const {
        email,
        source,
        authUrl,
        redirectTo,
        appContextId,
      } = input;
      return applicationService.request('user.sendChangeEmailLink', {
        applicationId,
        appContextId,
        authUrl,
        redirectTo,
        source,
        newEmail: email,
        email: user.user.email,
      });
    },

    /**
     *
     */
    sendAppUserLoginLink: (_, { input }, { app }) => {
      const applicationId = app.getId();
      const {
        email,
        source,
        authUrl,
        redirectTo,
        appContextId,
        additionalContext,
      } = input;
      return applicationService.request('user.sendLoginLink', {
        additionalContext,
        applicationId,
        appContextId,
        authUrl,
        redirectTo,
        source,
        email,
      });
    },

    /**
     *
     */
    setAppUserBanned: (_, { input }, { app }) => {
      const applicationId = app.getId();
      const { id, value } = input;
      return applicationService.request('user.updateFieldWithApp', {
        applicationId,
        id,
        path: 'banned',
        value,
      });
    },

    /**
     *
     */
    setAppUserRegionalConsent: (_, { input }, { user }) => {
      const id = user.getId();
      const { answers } = input;
      return applicationService.request('user.regionalConsentAnswer.setMany', { id, answers });
    },

    /**
     *
     */
    setAppUserUnverifiedData: (_, { input }, { app }) => {
      const applicationId = app.getId();
      const {
        email,
        givenName,
        familyName,
        organization,
        organizationTitle,
        countryCode,
        regionCode,
        postalCode,
        city,
        street,
        addressExtra,
        mobileNumber,
        phoneNumber,
        regionalConsentAnswers,
        // customBooleanFieldAnswers,
        customSelectFieldAnswers,
        // customTextFieldAnswers,
      } = input;

      const payload = {
        givenName,
        familyName,
        organization,
        organizationTitle,
        countryCode,
        regionCode,
        postalCode,
        city,
        street,
        addressExtra,
        mobileNumber,
        phoneNumber,
        regionalConsentAnswers,
        // customBooleanFieldAnswers,
        customSelectFieldAnswers,
        // customTextFieldAnswers,
      };

      return applicationService.request('user.setUnverifiedData', {
        applicationId,
        email,
        payload,
      });
    },

    /**
     *
     */
    updateAppUser: (_, { input }, { app }) => {
      const applicationId = app.getId();
      const { id, payload } = input;
      const {
        email,
        givenName,
        familyName,
        accessLevelIds,
        teamIds,
        organization,
        organizationTitle,
        countryCode,
        regionCode,
        postalCode,
        city,
        street,
        addressExtra,
        mobileNumber,
        phoneNumber,
        forceProfileReVerification,
        receiveEmail,
      } = payload;

      return applicationService.request('user.updateOne', {
        id,
        applicationId,
        payload: {
          email,
          givenName,
          familyName,
          accessLevelIds,
          teamIds,
          organization,
          organizationTitle,
          countryCode,
          regionCode,
          postalCode,
          city,
          street,
          addressExtra,
          mobileNumber,
          phoneNumber,
          forceProfileReVerification,
          receiveEmail,
        },
      });
    },

    /**
     *
     */
    updateAppUserCustomAttributes: (_, { input }, { app }) => {
      const applicationId = app.getId();
      const { id, attributes } = input;
      return applicationService.request('user.updateCustomAttributes', {
        id,
        applicationId,
        attributes,
      });
    },

    /**
     *
     */
    updateOwnAppUserCustomAttributes: (_, { input }, { user }) => {
      const id = user.getId();
      const applicationId = user.getAppId();
      const { attributes } = input;
      return applicationService.request('user.updateCustomAttributes', {
        id,
        applicationId,
        attributes,
      });
    },

    /**
     *
     */
    updateAppUserCustomBooleanAnswers: (_, { input }, { app }) => {
      const applicationId = app.getId();
      const { id, answers } = input;
      return applicationService.request('user.updateCustomBooleanAnswers', {
        id,
        applicationId,
        answers,
      });
    },

    /**
     *
     */
    updateOwnAppUserCustomBooleanAnswers: (_, { input }, { user }) => {
      const id = user.getId();
      const applicationId = user.getAppId();
      const { answers } = input;
      return applicationService.request('user.updateCustomBooleanAnswers', {
        id,
        applicationId,
        answers,
        profileLastVerifiedAt: new Date(),
      });
    },

    /**
     *
     */
    updateAppUserCustomSelectAnswers: (_, { input }, { app }) => {
      const applicationId = app.getId();
      const { id, answers } = input;
      return applicationService.request('user.updateCustomSelectAnswers', {
        id,
        applicationId,
        answers,
      });
    },

    /**
     *
     */
    updateOwnAppUserCustomSelectAnswers: (_, { input }, { user }) => {
      const id = user.getId();
      const applicationId = user.getAppId();
      const { answers } = input;
      return applicationService.request('user.updateCustomSelectAnswers', {
        id,
        applicationId,
        answers,
        profileLastVerifiedAt: new Date(),
      });
    },

    /**
     *
     */
    updateAppUserCustomTextAnswers: (_, { input }, { app }) => {
      const applicationId = app.getId();
      const { id, answers } = input;
      return applicationService.request('user.updateCustomTextAnswers', {
        id,
        applicationId,
        answers,
      });
    },

    /**
     *
     */
    updateOwnAppUserCustomTextAnswers: (_, { input }, { user }) => {
      const id = user.getId();
      const applicationId = user.getAppId();
      const { answers } = input;
      return applicationService.request('user.updateCustomTextAnswers', {
        id,
        applicationId,
        answers,
        profileLastVerifiedAt: new Date(),
      });
    },

    /**
     *
     */
    updateOwnAppUser: (_, { input }, { user }) => {
      const id = user.getId();
      const applicationId = user.getAppId();
      const {
        givenName,
        familyName,
        organization,
        organizationTitle,
        countryCode,
        regionCode,
        postalCode,
        city,
        street,
        addressExtra,
        mobileNumber,
        phoneNumber,
        receiveEmail,
      } = input;
      return applicationService.request('user.updateOne', {
        id,
        applicationId,
        payload: {
          givenName,
          familyName,
          organization,
          organizationTitle,
          countryCode,
          regionCode,
          postalCode,
          city,
          street,
          addressExtra,
          mobileNumber,
          phoneNumber,
          receiveEmail,
          profileLastVerifiedAt: new Date(),
        },
      });
    },
  },
};
