import Component from '@ember/component';
import { set } from '@ember/object';
import { inject } from '@ember/service';

export default Component.extend({
  router: inject(),

  tagName: '',
  fieldType: 'select',
  title: null,
  isActionRunning: false,
  isUpdating: false,
  optionExternalIdsEnabled: false,

  init() {
    this._super(...arguments);
    if (!this.model) this.set('model', { options: [], createType: 'select' });
    if (!this.model.externalId) this.set('model.externalId', { namespace: {}, identifier: {} });
  },

  actions: {
    removeOption(option) {
      const confirm = `Are you sure you want to remove option ${option.label}? All users who previously selected ${option.label} will no longer have this data as an answer.`;
      if (this.isUpdating) {
        if (window.confirm(confirm)) this.get('model.options').removeObject(option);
      } else {
        this.get('model.options').removeObject(option);
      }
    },

    reorderOptions(options) {
      this.set('model.options', options);
    },

    clearOptionExternalIds() {
      this.set('optionExternalIdsEnabled', false);
      this.get('model.options').forEach((option) => {
        set(option, 'externalIdentifier', null);
      });
    },

    enableOptionExternalIds() {
      this.set('optionExternalIdsEnabled', true);
    },

    setFieldType(value) {
      this.set('model.createType', value);
    },

    returnToList() {
      return this.router.transitionTo('manage.orgs.view.apps.view.fields');
    },
  },
});
