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
      // Find the item by ID, and remove it from the array
      const item = this.get('model.options').findBy('id', option.id);
      const confirm = `Are you sure you want to remove option ${item.label}? All users who previously selected ${item.label} will no longer have this data as an answer.`;
      if (this.isUpdating && item.id) {
        if (window.confirm(confirm)) this.get('model.options').removeObject(item);
      } else {
        this.get('model.options').removeObject(item);
      }
    },

    removeGroup(group) {
      // Find the item by ID, and remove it from the array
      const item = this.get('model.groups').findBy('id', group.id);
      this.get('model.groups').removeObject(item);
    },

    /**
     * set model.options and model.groups based on incoming ordered selection array.
     */
    reorder(ordered) {
      let i = 0;
      ordered.forEach((item) => {
        set(item, 'index', i);
        i++;
        if (item.__typename === 'SelectFieldOptionGroup') {
          const optionIds = item.optionIds || [];
          optionIds.forEach((optionId) => {
            const option = this.get('model.options').findBy('id', optionId);
            if (option) {
              set(option, 'index', i);
              i++;
            }
          });
        }
      });
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
