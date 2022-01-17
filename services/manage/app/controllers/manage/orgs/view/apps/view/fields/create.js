import Controller from '@ember/controller';
import ActionMixin from '@identity-x/manage/mixins/action-mixin';
import AppQueryMixin from '@identity-x/manage/mixins/app-query';
import gql from 'graphql-tag';
import { inject } from '@ember/service';

const mutations = {
  select: {
    mutation: gql`
      mutation AppSelectFieldCreate($input: CreateSelectFieldMutationInput!) {
        createSelectField(input: $input) {
          id
        }
      }`,
    fieldType: 'createSelectField',
  },
  boolean: {
    mutation: gql`
      mutation AppBooleanFieldCreate($input: CreateBooleanFieldMutationInput!) {
        createBooleanField(input: $input) {
          id
        }
      }`,
    fieldType: 'createBooleanField',
  }
};

export default Controller.extend(ActionMixin, AppQueryMixin, {
  errorNotifier: inject(),

  actions: {
    /**
     *
     * @param {*} closeModal
     */
    async create(closeModal) {
      try {
        this.startAction();
        const {
          name,
          label,
          createType
        } = this.get('model');
        const input = {
          name,
          label,
        };

        const variables = { input };
        const refetchQueries = ['AppFields'];
        const { mutation, fieldType } = mutations[createType];
        await this.mutate({ mutation, variables, refetchQueries }, fieldType);
        await closeModal();
      } catch (e) {
        this.errorNotifier.show(e);
      } finally {
        this.endAction();
      }
    },
  },
});
