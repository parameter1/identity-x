import Controller from '@ember/controller';
import ActionMixin from '@identity-x/manage/mixins/action-mixin';
import AppQueryMixin from '@identity-x/manage/mixins/app-query';
import gql from 'graphql-tag';
import { inject } from '@ember/service';
import fragment from '@identity-x/manage/graphql/fragments/app-user-list';

const mutation = gql`
  mutation AppUserEditAddress($input: UpdateAppUserMutationInput!) {
    updateAppUser(input: $input) {
      ...AppUserListFragment
    }
  }
  ${fragment}
`;

export default Controller.extend(ActionMixin, AppQueryMixin, {
  errorNotifier: inject(),

  actions: {
    async update() {
      try {
        this.startAction();
        const {
          id,
          email,
          countryCode,
          regionCode,
          postalCode,
          city,
          address,
          address2,
        } = this.get('model');

        const payload = {
          email,
          countryCode,
          regionCode,
          postalCode,
          city,
          address,
          address2,
        };
        const input = { id, payload };
        const variables = { input };
        await this.mutate({ mutation, variables }, 'updateAppUser');
      } catch (e) {
        this.errorNotifier.show(e);
      } finally {
        this.endAction();
      }
    },
  },
});
