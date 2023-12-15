const { applicationService } = require('@identity-x/service-clients');
const connectionProjection = require('../utils/connection-projection');
const typeProjection = require('../utils/type-projection');

const { isArray } = Array;

module.exports = {
  Cohort: {
    id: cohort => cohort._id,
    rules: ({ rules }) => {
      if (!isArray(rules) || !rules.length) return [];
      return rules;
    },
  },

  CohortRule: {
    id: rule => rule._id,
    conditions: async ({ conditions }) => {
      if (!isArray(conditions) || !conditions.length) return [];
      const ids = [...new Set(conditions.map(c => c.field))];
      const found = await applicationService.request('cohort.fieldsByIds', { ids });
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
    cohorts: (_, { input }, { app }, info) => {
      const id = app.getId();
      const { sort, pagination } = input;
      const fields = connectionProjection(info);
      return applicationService.request('cohort.listForApp', {
        id,
        sort,
        pagination,
        fields,
      });
    },

    matchCohorts: (_, { input }, { app }, info) => {
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

      return applicationService.request('cohort.matchForApp', {
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

    cohort: (_, { input }, ctx, info) => {
      const { id } = input;
      const fields = typeProjection(info);
      return applicationService.request('cohort.findById', { id, fields });
    },
  },

  Mutation: {
    /**
     *
     */
    createCohort: (_, { input }, { app }) => {
      const applicationId = app.getId();
      // const { rules } = input;
      return applicationService.request('cohort.create', {
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
    updateCohort: (_, { input }, { app }) => {
      const applicationId = app.getId();
      const { id, payload } = input;
      // const { rules } = payload;
      return applicationService.request('cohort.updateOne', {
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
