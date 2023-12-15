import Route from '@ember/routing/route';
import AppQueryMixin from '@identity-x/manage/mixins/app-query';
import gql from 'graphql-tag';
import fragment from '@identity-x/manage/graphql/fragments/cohort-list';

const query = gql`
  query AppCohortsEdit($input: CohortQueryInput!) {
    cohort(input: $input) {
      ...CohortListFragment
    }
  }
  ${fragment}
`;

export default Route.extend(AppQueryMixin, {
  model({ cohort_id: id }) {
    const input = { id };
    const variables = { input };
    return this.query({ query, variables, fetchPolicy: 'network-only' }, 'cohort');
  },
});
