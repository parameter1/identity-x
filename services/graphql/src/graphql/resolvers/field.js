const { applicationService } = require('@identity-x/service-clients');
const { UserInputError } = require('apollo-server-express');
const typeProjection = require('../utils/type-projection');

const { isArray } = Array;

module.exports = {
  /**
   *
   */
  FieldInterface: {
    /**
     *
     */
    __resolveType: ({ _type: type }) => {
      const prefix = `${type.charAt(0).toUpperCase()}${type.slice(1)}`;
      return `${prefix}Field`;
    },
  },

  /**
   *
   */
  FieldInterfaceExternalEntityId: {
    id: externalId => externalId._id,
  },

  /**
   *
   */
  FieldValue: {
    /**
     *
     */
    value({ value }) {
      return `${value}`;
    },
  },

  /**
   *
   */
  BooleanField: {
    /**
     *
     */
    id: field => field._id,

    /**
     *
     */
    type: field => field._type,
  },

  /**
   *
   */
  SelectField: {
    /**
     *
     */
    id: field => field._id,

    /**
     *
     */
    type: field => field._type,

    /**
     *
     */
    options: field => (isArray(field.options) ? field.options : []).sort((a, b) => {
      if (a.index > b.index) return 1;
      if (a.index < b.index) return -1;
      return 0;
    }).map(option => ({ field, ...option })),
  },

  /**
   *
   */
  SelectFieldOption: {
    /**
     *
     */
    id: option => option._id,
    /**
     *
     */
    externalIdentifier: ({ field, option }) => (
      field.externalId ? option.externalIdentifier : null
    ),
  },

  /**
   *
   */
  SelectFieldOptionAnswer: {
    /**
     * Legacy support for the old answer format
     */
    id: ({ option }) => option._id,
    label: ({ option }) => option.label,
    externalIdentifier: ({ option }) => option.externalIdentifier,
  },

  /**
   *
   */
  Mutation: {
    /**
     *
     */
    createBooleanField: (_, { input }, { app }) => {
      const {
        name,
        label,
        required,
        active,
        externalId,
      } = input;
      const applicationId = app.getId();
      return applicationService.request('field.create', {
        type: 'boolean',
        applicationId,
        payload: {
          name,
          label,
          required,
          active,
          externalId,
        },
      });
    },

    /**
     *
     */
    createSelectField: (_, { input }, { app }) => {
      const {
        name,
        label,
        required,
        active,
        multiple,
        externalId,
        options,
      } = input;
      const applicationId = app.getId();
      return applicationService.request('field.create', {
        type: 'select',
        applicationId,
        payload: {
          name,
          label,
          required,
          active,
          multiple,
          externalId,
          options,
        },
      });
    },

    /**
     *
     */
    /**
     *
     */
    updateBooleanField: (_, { input }, { app }) => {
      const applicationId = app.getId();
      const {
        id,
        name,
        label,
        required,
        active,
        externalId,
        whenTrue,
        whenFalse,
      } = input;
      return applicationService.request('field.updateOne', {
        id,
        type: 'boolean',
        applicationId,
        payload: {
          name,
          label,
          required,
          active,
          externalId,
          whenTrue,
          whenFalse,
        },
      });
    },

    /**
     *
     */
    /**
     *
     */
    updateSelectField: (_, { input }, { app }) => {
      const applicationId = app.getId();
      const {
        id,
        name,
        label,
        required,
        active,
        multiple,
        externalId,
        options,
      } = input;
      if (!options.length) throw new UserInputError('The select field options cannot be empty.');
      return applicationService.request('field.updateOne', {
        id,
        type: 'select',
        applicationId,
        payload: {
          name,
          label,
          required,
          active,
          multiple,
          externalId,
          options,
        },
      });
    },
  },

  /**
   *
   */
  Query: {
    /**
     *
     */
    fields: (_, { input }, { app }) => {
      const id = app.getId();
      const { sort, pagination } = input;
      return applicationService.request('field.listForApp', {
        id,
        sort,
        pagination,
      });
    },

    /**
     *
     */
    matchFields: (_, { input }, { app }) => {
      const applicationId = app.getId();

      const {
        field,
        phrase,
        position,
        pagination,
        sort,
        excludeIds,
      } = input;

      return applicationService.request('field.matchForApp', {
        applicationId,
        field,
        phrase,
        position,
        pagination,
        sort,
        excludeIds,
      });
    },

    /**
     *
     */
    booleanField: (_, { input }, ctx, info) => {
      const { id } = input;
      const fields = typeProjection(info);
      return applicationService.request('field.findById', { id, type: 'boolean', fields });
    },

    /**
     *
     */
    selectField: (_, { input }, ctx, info) => {
      const { id } = input;
      const fields = typeProjection(info);
      return applicationService.request('field.findById', { id, type: 'select', fields });
    },
  },
};
