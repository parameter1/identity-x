import Controller from '@ember/controller';
import ActionMixin from '@identity-x/manage/mixins/action-mixin';
import AppQueryMixin from '@identity-x/manage/mixins/app-query';
import gql from 'graphql-tag';
import { inject } from '@ember/service';

const mutation = gql`
  mutation AppSelectFieldCreate($input: CreateSelectFieldMutationInput!) {
    createSelectField(input: $input) {
      id
    }
  }
`;

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
          options,
          required,
          active,
          multiple,
          externalId,
        } = this.get('model');
        const input = {
          name,
          label,
          required,
          active,
          multiple,
          externalId: {
            ...(externalId && externalId.namespace && externalId.namespace.type && {
              namespace: {
                provider: externalId.namespace.provider,
                tenant: externalId.namespace.tenant,
                type: externalId.namespace.type,
              },
            }),
            ...(externalId && externalId.identifier && externalId.identifier.value && {
              identifier: { value: externalId.identifier.value },
            }),
          },
          options: options.map((option) => ({ id: option.id, label: option.label, externalIdentifier: option.externalIdentifier })),
        };
        if (!Object.keys(input.externalId).length) delete input.externalId;
        const variables = { input };
        const refetchQueries = ['AppFields'];
        await this.mutate({ mutation, variables, refetchQueries }, 'createSelectField');
        await closeModal();
      } catch (e) {
        this.errorNotifier.show(e);
      } finally {
        this.endAction();
      }
    },
  },
});
