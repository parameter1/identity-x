import Controller from '@ember/controller';
import ActionMixin from '@identity-x/manage/mixins/action-mixin';
import AppQueryMixin from '@identity-x/manage/mixins/app-query';
import gql from 'graphql-tag';
import { inject } from '@ember/service';

const mutation = gql`
  mutation AppCohortCreate($input: CreateCohortMutationInput!) {
    createCohort(input: $input) {
      id
    }
  }
`;

export default Controller.extend(ActionMixin, AppQueryMixin, {
  errorNotifier: inject(),

  actions: {
    async create(closeModal) {
      try {
        this.startAction();
        const {
          name,
          active,
          description,
          rules,
        } = this.get('model');
        const input = {
          name,
          active,
          description,
          rules,
        };
        const variables = { input };
        const refetchQueries = ['AppCohorts'];
        await this.mutate({ mutation, variables, refetchQueries }, 'createCohort');
        await closeModal();
      } catch (e) {
        this.errorNotifier.show(e);
      } finally {
        this.endAction();
      }
    },
  },
});
