import Route from '@ember/routing/route';
import AppQueryMixin from '@identity-x/manage/mixins/app-query';
import gql from 'graphql-tag';

const query = gql`
  query AppFieldsEdit($input: SelectFieldQueryInput!) {
    selectField(input: $input) {
      id
      type
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
      choices {
        id
        label
        index
        ... on SelectFieldOption {
          externalIdentifier
          canWriteIn
          selectableAnswer
        }
        ... on SelectFieldOptionGroup {
          options {
            id
            label
            index
            externalIdentifier
            selectableAnswer
            canWriteIn
          }
        }
      }
      options {
        id
        label
        externalIdentifier
        selectableAnswer
        canWriteIn
        index
      }
      groups {
        id
        label
        optionIds
        index
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
