const { membershipService, organizationService, userService } = require('@identity-x/service-clients');
const { UserInputError } = require('apollo-server-express');
const { getAsObject } = require('@base-cms/object-path');

module.exports = {
  User: {
    id: (user) => user._id,
  },

  Query: {
    activeUser: (_, args, { user }) => {
      const email = user.get('email');
      return userService.request('findByEmail', { email });
    },

    userOrganizations: (_, args, { user }) => {
      const email = user.get('email');
      return membershipService.request('listForUser', { email });
    },

    userInvitations: (_, args, { user }) => {
      const email = user.get('email');
      return membershipService.request('listInvitesForUser', { email });
    },

    viewInvitation: (_, { input }, { user }) => {
      const { organizationId } = input;
      const email = user.get('email');
      return membershipService.request('viewInvite', { organizationId, email });
    },
  },

  Mutation: {
    /**
     *
     */
    acceptOrgInvite: async (_, { input }, { user }) => {
      const { organizationId } = input;
      const email = user.get('email');
      await membershipService.request('acceptInvite', { email, organizationId });
      return 'ok';
    },

    /**
     *
     */
    rejectOrgInvite: async (_, { input }, { user }) => {
      const { organizationId } = input;
      const email = user.get('email');
      await membershipService.request('deleteInvite', { email, organizationId });
      return 'ok';
    },

    /**
     *
     */
    inviteUserToOrg: (_, { input }, { org, user }) => {
      const { email, role } = input;
      const organizationId = org.getId();
      const invitedByEmail = user.get('email');
      return membershipService.request('invite', {
        email,
        organizationId,
        role,
        invitedByEmail,
      });
    },

    /**
     * @todo This should require reCaptcha to prevent spam.
     */
    registerNewUser: async (_, { input }) => {
      const {
        email,
        givenName,
        familyName,

        orgName,
      } = input;

      const company = getAsObject(input, 'company');

      const orgPayload = {
        name: orgName,
        company: {
          ...company,
          ...(!company.name && { name: orgName }),
        },
      };
      const userPayload = { givenName, familyName };
      const user = await userService.request('create', { email, payload: userPayload });
      const organization = await organizationService.request('create', { payload: orgPayload });
      await membershipService.request('create', {
        organizationId: organization._id,
        email: user.email,
        role: 'Owner',
      });
      await userService.request('sendLoginLink', { email: user.email });
      return { user, organization };
    },

    /**
     *
     */
    removeUserFromOrg: async (_, { input }, { org, user }) => {
      const { email } = input;
      const organizationId = org.getId();
      if (email === user.get('email')) throw new UserInputError('As an organization owner, you cannot remove yourself.');
      return membershipService.request('delete', { organizationId, email });
    },

    /**
     *
     */
    removeUserInvite: async (_, { input }, { org }) => {
      const { email } = input;
      const organizationId = org.getId();
      await membershipService.request('deleteInvite', { email, organizationId });
    },

    /**
     *
     */
    sendUserLoginLink: (_, { input }) => {
      const { email } = input;
      return userService.request('sendLoginLink', { email });
    },

    /**
     *
     */
    updateUserProfile: (_, { input }, { user }) => {
      const { givenName, familyName, photoURL } = input;
      const payload = { givenName, familyName, photoURL };
      const email = user.get('email');
      return userService.request('update', { email, payload });
    },

    /**
     *
     */
    updateUserOrgRole: (_, { input }, { org, user }) => {
      const { email, role } = input;
      const organizationId = org.getId();
      if (email === user.get('email')) throw new UserInputError('As an organization owner, you cannot change your role.');
      return membershipService.request('changeRole', { organizationId, email, role });
    },

    /**
     *
     */
    userLogin: (_, { input }, { req }) => {
      const { token } = input;
      const ua = req.get('user-agent');
      return userService.request('login', { token, ip: req.ip, ua });
    },

    /**
     *
     */
    userLogout: async (_, args, { user }) => {
      await userService.request('logout', { token: user.token });
      return 'ok';
    },
  },
};
