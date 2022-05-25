import Component from '@ember/component';
import { set, computed } from '@ember/object';
import { inject } from '@ember/service';

export default Component.extend({
  router: inject(),

  tagName: '',
  fieldType: 'select',
  title: null,
  isActionRunning: false,
  isUpdating: false,
  optionExternalIdsEnabled: false,

  canSubmit: computed('optionExternalIdsEnabled', 'model.options.@each.externalIdentifier', function() {
    const optionExternalIdsEnabled = this.get('optionExternalIdsEnabled');
    if (!optionExternalIdsEnabled) return true;
    const options = this.get('model.options') || [];
    return options.every((option) => option.externalIdentifier);
  }),

  isSubmitDisabled: computed.not('canSubmit'),

  init() {
    this._super(...arguments);
    if (!this.model) this.set('model', { choices: [], createType: 'select' });
    if (!this.model.externalId) this.set('model.externalId', { namespace: {}, identifier: {} });
  },

  actions: {
    removeOption(option) {
      const confirm = `Are you sure you want to remove option ${option.label}? All users who previously selected ${option.label} will no longer have this data as an answer.`;
      if (this.isUpdating && option.id) {
        if (window.confirm(confirm)) this.get('model.choices').removeObject(option);
      } else {
        this.get('model.choices').removeObject(option);
      }
    },

    removeGroup(group) {
      const confirm = `Are you sure you want to remove group ${group.label}? All child options will be ungrouped.`;
      if (this.isUpdating && group.id) {
        if (window.confirm(confirm)) {
          const options = group.options || [];
          options.forEach(option => this.get('model.choices').pushObject(option));
          this.get('model.choices').removeObject(group);
        }
      } else {
        const options = group.options || [];
        options.forEach(option => this.get('model.choices').pushObject(option));
        this.get('model.choices').removeObject(group);
      }
    },

    /**
     *
     */
    reorder(ordered) {
      let i = 0;
      ordered.forEach((item) => {
        set(item, 'index', i);
        i++;
        if (item.options) {
          const options = item.options || [];
          options.forEach((option) => {
            set(option, 'index', i);
            i++;
          });
        }
      });
      this.set('model.choices', ordered);
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
