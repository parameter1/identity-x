import Controller from '@ember/controller';
import ActionMixin from '@identity-x/manage/mixins/action-mixin';
import AppQueryMixin from '@identity-x/manage/mixins/app-query';
import gql from 'graphql-tag';
import { inject } from '@ember/service';

const mutation = gql`
  mutation AppFieldEdit($input: UpdateBooleanFieldMutationInput!) {
    updateBooleanField(input: $input) {
      id
      name
      label
      required
      active
      externalId {
        id
        namespace { provider tenant type }
        identifier { value }
      }
      whenTrue {
        value
        type
      }
      whenFalse {
        value
        type
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
          required,
          active,
          externalId,
          whenTrue,
          whenFalse,
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
          whenTrue: {
            type: whenTrue.type,
            value: whenTrue.value,
          },
          whenFalse: {
            type: whenFalse.type,
            value: whenFalse.value,
          },
        };
        if (!Object.keys(input.externalId).length) delete input.externalId;
        const variables = { input };
        await this.mutate({ mutation, variables }, 'updateBooleanField');
        await closeModal();
      } catch (e) {
        this.errorNotifier.show(e);
      } finally {
        this.endAction();
      }
    },
  },
});
