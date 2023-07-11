import Controller from '@ember/controller';
import ActionMixin from '@identity-x/manage/mixins/action-mixin';
import OrgQueryMixin from '@identity-x/manage/mixins/org-query';
import gql from 'graphql-tag';
import { inject } from '@ember/service';

const mutation = gql`
  mutation AppUpdate($input: UpdateApplicationMutationInput!) {
    updateApplication(input: $input) {
      id
      name
      email
      loginLinkTemplate {
        subject
        unverifiedVerbiage
        verifiedVerbiage
      }
      description
      language
    }
  }
`;

export default Controller.extend(ActionMixin, OrgQueryMixin, {
  errorNotifier: inject(),

  actions: {
    async update(closeModal) {
      try {
        this.startAction();
        const {
          id,
          name,
          description,
          loginLinkTemplate,
          email,
          language,
        } = this.get('model');
        const payload = {
          name,
          description,
          loginLinkTemplate: this.validateLoginLinkTemplateObj(loginLinkTemplate),
          email,
          language,
        };
        const input = { id, payload };
        const variables = { input };
        const refetchQueries = ['OrgApps'];
        await this.mutate({ mutation, variables, refetchQueries }, 'updateApplication');
        await closeModal();
      } catch (e) {
        this.errorNotifier.show(e)
      } finally {
        this.endAction();
      }
    },

    returnToAppList() {
      return this.transitionToRoute('manage.orgs.view.apps.list');
    },
  }
})
