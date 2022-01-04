import Controller from '@ember/controller';
import ActionMixin from '@identity-x/manage/mixins/action-mixin';
import AppQueryMixin from '@identity-x/manage/mixins/app-query';
import gql from 'graphql-tag';
import { inject } from '@ember/service';

const mutation = gql`
  mutation AppUserEditCustomBooleanFields($input: UpdateAppUserCustomBooleanAnswersMutationInput!) {
    updateAppUserCustomBooleanAnswers(input: $input) {
      id
      customBooleanFieldAnswers {
        id
        value
      }
    }
  }
`;

export default Controller.extend(ActionMixin, AppQueryMixin, {
  errorNotifier: inject(),

  actions: {
    async save() {
      try {
        this.startAction();
        const id = this.get('model.id');
        const input = {
          id,
          answers: this.get('model.customBooleanFieldAnswers').map((answer) => {
            const { value, field } = answer;
            return { fieldId: field.id, value };
          })
        };
        const variables = { input };
        await this.mutate({ mutation, variables }, 'updateAppUserCustomBooleanAnswers');
      } catch (e) {
        this.errorNotifier.show(e);
      } finally {
        this.endAction();
      }
    },
  },
});
