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
      choices {
        id
        label
        index
        ... on SelectFieldOption {
          externalIdentifier
          canWriteIn
          canSelect
        }
        ... on SelectFieldOptionGroup {
          options {
            id
            label
            index
            externalIdentifier
            canWriteIn
          }
        }
      }
      options {
        id
        index
        label
        externalIdentifier
        canWriteIn
      }
      groups {
        id
        index
        label
        optionIds
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
          externalId,
          choices,
        } = this.get('model');
        const { options, groups } = choices.reduce((arrs, choice) => {
          if (choice.__typename === 'SelectFieldOption') {
            arrs.options.push(choice);
          } else {
            const options = choice.options || [];
            arrs.groups.push({ ...choice, options});
            options.forEach(option => arrs.options.push(option));
          }
          return arrs;
        }, { options: [], groups: [] });

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
            index: option.index,
            label: option.label,
            externalIdentifier: option.externalIdentifier,
            canWriteIn: option.canWriteIn,
            canSelect: option.canSelect,
          })),
          groups: groups.map((group) => ({
            id: group.id,
            index: group.index,
            label: group.label,
            optionIds: group.options.map(option => option.id),
          })),
        };
        if (!Object.keys(input.externalId).length) delete input.externalId;
        const variables = { input };
        await this.mutate({ mutation, variables }, 'updateSelectField');
        if (closeModal) await closeModal();
      } catch (e) {
        this.errorNotifier.show(e);
      } finally {
        this.endAction();
      }
    },
  },
});
