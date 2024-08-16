import Controller from '@ember/controller';
import ActionMixin from '@identity-x/manage/mixins/action-mixin';
import AppQueryMixin from '@identity-x/manage/mixins/app-query';
import { inject } from '@ember/service';
import { computed } from '@ember/object';

export default Controller.extend(ActionMixin, AppQueryMixin, {
  router: inject(),

  isCustomActive: computed('router.currentRouteName', function() {
    return this.router.currentRouteName.includes('users.edit.custom-');
  }),
  customDropdownClasses: computed('isCustomActive', function() {
    const classes = ['nav-link', 'dropdown-toggle'];
    if (this.isCustomActive) classes.push('active');
    return classes.join(' ');
  }),

  actions: {
    returnToList() {
      return this.router.transitionTo('manage.orgs.view.apps.view.users');
    },
  },
});
