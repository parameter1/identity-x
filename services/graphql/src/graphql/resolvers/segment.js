const { applicationService } = require('@identity-x/service-clients');
const connectionProjection = require('../utils/connection-projection');
const typeProjection = require('../utils/type-projection');

const { isArray } = Array;

module.exports = {
  Segment: {
    id: segment => segment._id,
    /**
     * @param {Object} segment
     * @param {Object} variables
     * @param {import('../context/index.js').GraphQLServerContext} context
     */
    context: ({ appContextId }, variables, { app }) => {
      if (!appContextId) return null;
      return app.get('contexts', []).find(ctx => ctx._id === appContextId);
    },
    rules: ({ rules }) => {
      if (!isArray(rules) || !rules.length) return [];
      return rules;
    },
  },

  SegmentRule: {
    id: rule => rule._id,
    conditions: async ({ conditions }) => {
      if (!isArray(conditions) || !conditions.length) return [];
      const ids = [...new Set(conditions.map(c => c.field))];
      const found = await applicationService.request('segment.fieldsByIds', { ids });
      const fieldMap = found.reduce((map, field) => {
        map.set(field._id, field);
        return map;
      }, new Map());

      return conditions.map((condition) => {
        const field = fieldMap.get(condition.field);
        return {
          id: `${condition.field}_${condition.answer}`,
          field,
          answer: field.options.find(o => `${o._id}` === `${condition.answer}`),
        };
      });
    },
  },

  Query: {
    /**
     *
     */
    segments: (_, { input }, { app }, info) => {
      const id = app.getId();
      const { appContextId, sort, pagination } = input;
      const fields = connectionProjection(info);
      return applicationService.request('segment.listForApp', {
        id,
        ...(appContextId && { query: { appContextId } }),
        sort,
        pagination,
        fields,
      });
    },

    matchSegments: (_, { input }, { app }, info) => {
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

      return applicationService.request('segment.matchForApp', {
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

    segment: (_, { input }, ctx, info) => {
      const { id } = input;
      const fields = typeProjection(info);
      return applicationService.request('segment.findById', { id, fields });
    },
  },

  Mutation: {
    /**
     *
     */
    createSegment: (_, { input }, { app }) => {
      const applicationId = app.getId();
      // const { rules } = input;
      return applicationService.request('segment.create', {
        applicationId,
        payload: {
          ...input,
          // rules: isArray(rules) ? rules.map(value => ({ value })) : [],
        },
      });
    },

    /**
     *
     */
    updateSegment: (_, { input }, { app }) => {
      const applicationId = app.getId();
      const { id, payload } = input;
      // const { rules } = payload;
      return applicationService.request('segment.updateOne', {
        id,
        applicationId,
        payload: {
          ...payload,
          // rules: isArray(rules) ? rules.map(value => ({ value })) : [],
        },
      });
    },
  },
};
