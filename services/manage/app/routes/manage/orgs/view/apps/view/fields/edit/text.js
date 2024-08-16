import Route from '@ember/routing/route';
import AppQueryMixin from '@identity-x/manage/mixins/app-query';
import gql from 'graphql-tag';

const query = gql`
  query AppFieldsEdit($input: TextFieldQueryInput!) {
    textField(input: $input) {
      id
      type
      name
      label
      required
      active
      externalId {
        id
        identifier { value }
        namespace { provider tenant type }
      }
    }
  }
`;

export default Route.extend(AppQueryMixin, {
  model({ field_id: id }) {
    const input = { id };
    const variables = { input };
    return this.query({ query, variables, fetchPolicy: 'network-only' }, 'textField');
  },
});
