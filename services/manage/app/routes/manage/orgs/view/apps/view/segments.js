import Route from '@ember/routing/route';
import AppQueryMixin from '@identity-x/manage/mixins/app-query';
import ListRouteMixin from '@identity-x/manage/mixins/list-route';
import gql from 'graphql-tag';
import fragment from '@identity-x/manage/graphql/fragments/segment-list';

const segments = gql`
  query AppSegments($input: SegmentsQueryInput!) {
    segments(input: $input) {
      edges {
        node {
          ...SegmentListFragment
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

const matchSegments = gql`
  query AppSegmentsMatch($input: MatchSegmentsQueryInput!) {
    matchSegments(input: $input) {
      edges {
        node {
          ...SegmentListFragment
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
    const query = { key: 'segments', op: segments };
    const search = { key: 'matchSegments', op: matchSegments };
    return this.getResults(apollo, { query, search, params });
  },
});
