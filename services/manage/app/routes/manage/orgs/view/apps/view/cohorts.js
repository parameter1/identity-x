import Route from '@ember/routing/route';
import AppQueryMixin from '@identity-x/manage/mixins/app-query';
import ListRouteMixin from '@identity-x/manage/mixins/list-route';
import gql from 'graphql-tag';
import fragment from '@identity-x/manage/graphql/fragments/cohort-list';

const cohorts = gql`
  query AppCohorts($input: CohortsQueryInput!) {
    cohorts(input: $input) {
      edges {
        node {
          ...CohortListFragment
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
      totalCount
    }
  }
  ${fragment}
`;

const matchCohorts = gql`
  query AppCohortsMatch($input: MatchCohortsQueryInput!) {
    matchCohorts(input: $input) {
      edges {
        node {
          ...CohortListFragment
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
      totalCount
    }
  }
  ${fragment}
`;

export default Route.extend(AppQueryMixin, ListRouteMixin, {
  async model(params) {
    const apollo = this.query.bind(this);
    const query = { key: 'cohorts', op: cohorts };
    const search = { key: 'matchCohorts', op: matchCohorts };
    return this.getResults(apollo, { query, search, params });
  },
});
