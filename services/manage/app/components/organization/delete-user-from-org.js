import Component from '@ember/component';
import ActionMixin from '@identity-x/manage/mixins/action-mixin';
import OrgQueryMixin from '@identity-x/manage/mixins/org-query';
import { inject } from '@ember/service';
import gql from 'graphql-tag';

const mutation = gql`
  mutation DeleteUserFromOrg($input: DeleteAppUserForCurrentOrgInput!) {
    deleteAppUserForCurrentOrg(input: $input)
  }
`;

export default Component.extend(ActionMixin, OrgQueryMixin, {
  email: null,
  errorNotifier: inject(),
  result: null,
  resultEmail: null,

  actions: {
    async delete() {
      this.set('result', null);
      this.startAction();
      try {
        const input = { email: this.email };
        const result = await this.mutate({ mutation, variables: { input } }, 'deleteAppUserForCurrentOrg');
        this.set('resultEmail', this.email);
        this.set('email', null);
        this.set('result', result);
      } catch(e) {
        this.errorNotifier.show(e);
      } finally {
        this.endAction();
      }
    }
  },
});
