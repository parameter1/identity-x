import Controller from '@ember/controller';
import ActionMixin from '@identity-x/manage/mixins/action-mixin';
import AppQueryMixin from '@identity-x/manage/mixins/app-query';
import gql from 'graphql-tag';
import { inject } from '@ember/service';

const mutation = gql`
  mutation AppFieldEdit($input: UpdateSelectFieldMutationInput!) {
    updateSelectField(input: $input) {
      id
      name
      label
      multiple
      required
      active
      externalId {
        id
        namespace { provider tenant type }
        identifier { value }
      }
      options {
        id
        label
        externalIdentifier
        canWriteIn
      }
    }
  }
`;

export default Controller.extend(ActionMixin, AppQueryMixin, {
  errorNotifier: inject(),

  actions: {
    async update(closeModal) {
      try {
        this.startAction();
        const {
          id,
          name,
          label,
          multiple,
          required,
          active,
          options,
          externalId,
        } = this.get('model');

        const input = {
          id,
          name,
          label,
          required,
          active,
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
          multiple,
          options: options.map((option) => ({
            id: option.id,
            label: option.label,
            externalIdentifier: option.externalIdentifier,
            canWriteIn: option.canWriteIn,
          })),
        };
        if (!Object.keys(input.externalId).length) delete input.externalId;
        const variables = { input };
        await this.mutate({ mutation, variables }, 'updateSelectField');
        await closeModal();
      } catch (e) {
        this.errorNotifier.show(e);
      } finally {
        this.endAction();
      }
    },
  },
});
