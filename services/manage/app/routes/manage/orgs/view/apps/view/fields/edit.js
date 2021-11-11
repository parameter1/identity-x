import Route from '@ember/routing/route';
import AppQueryMixin from '@identity-x/manage/mixins/app-query';
import gql from 'graphql-tag';

const query = gql`
  query AppFieldsEdit($input: SelectFieldQueryInput!) {
    selectField(input: $input) {
      id
      name
      label
      multiple
      required
      active
      externalId {
        id
        identifier { value }
        namespace { provider tenant type }
      }
      options {
        id
        label
        externalIdentifier
      }
    }
  }
`;

export default Route.extend(AppQueryMixin, {
  model({ field_id: id }) {
    const input = { id };
    const variables = { input };
    return this.query({ query, variables, fetchPolicy: 'network-only' }, 'selectField');
  },
});
