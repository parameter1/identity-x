import Route from '@ember/routing/route';
import AppQueryMixin from '@identity-x/manage/mixins/app-query';
import gql from 'graphql-tag';

const query = gql`
  query AppUsersEditCustomSelectFields($input: AppUserQueryInput!) {
    appUser(input: $input) {
      id
      email
      customSelectFieldAnswers {
        id
        field {
          id
          name
          label
          multiple
          active
          choices {
            id
            label
            ... on SelectFieldOption {
              canWriteIn
              selectableAnswer
            }
            ... on SelectFieldOptionGroup {
              options {
                id
                label
                canWriteIn
              }
            }
          }
        }
        answers {
          id
          label
          option {
            canWriteIn
          }
          writeInValue
        }
      }
    }
  }
`;

export default Route.extend(AppQueryMixin, {
  model() {
    const { email } = this.modelFor('manage.orgs.view.apps.view.users.edit');
    const input = { email };
    const variables = { input };
    return this.query({ query, variables, fetchPolicy: 'network-only' }, 'appUser');
  },
});
