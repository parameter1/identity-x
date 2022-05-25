import Component from '@ember/component';
import { computed, set } from '@ember/object';

const { isArray } = Array;

export default Component.extend({
  disabled: false,
  showOptions: false,

  editButtonClasses: computed('showOptions', function() {
    const classes = ['btn'];
    if (this.showOptions) classes.push('btn-secondary');
    if (!this.showOptions) classes.push('btn-outline-secondary');
    return classes.join(' ');
  }),

  selectedOptions: computed('model.options.{@each.index,[]}', 'options.{@each.index,[]}', function() {
    const selected = this.get('model.options') || [];
    const optionIds = selected.map(o => o.id);
    const options = this.get('options') || [];
    return options.filter((option) => optionIds.includes(option.id)).sort((a, b) => a.index - b.index);
  }),

  selectableOptions: computed('model.options.[]', 'options.[]', 'disabledOptionIds.[]', function() {
    const selected = this.get('model.options') || [];
    const optionIds = selected.map(o => o.id);
    const options = this.get('options') || [];
    const disabledOptionIds = this.get('disabledOptionIds') || [];
    return options.filter((option) => !optionIds.includes(option.id) && !disabledOptionIds.includes(option.id) && option.id);
  }),

  isEditDisabled: computed('model.options.[]', 'disabled', function() {
    const disabled = this.get('disabled');
    if (disabled) return true;
    const options = this.get('model.options') || [];
    return options.length === 0;
  }),

  groupName: computed('label', function() {
    return `group-${this.label}`;
  }),

  init() {
    this._super(...arguments);
    if (!isArray(this.options)) this.set('options', []);
    if (!isArray(this.choices)) this.set('choices', []);
  },

  actions: {
    handleChange(selection) {
      const options = this.get('model.options') || [];
      const oldIds = options.map(o => o.id);
      const newIds = selection.map((option) => option.id);

      oldIds.forEach((oldId) => {
        if (!newIds.includes(oldId)) {
          // Remove option from group
          const option = this.get('options').find((o) => o.id === oldId);
          this.get('choices').pushObject(option);
        }
      });
      newIds.forEach((newId) => {
        if (!oldIds.includes(newId)) {
          // Remove option from choices
          const choice = this.get('choices').find((o) => o.id === newId);
          this.get('choices').removeObject(choice);
        }
      });
      this.set('model.options', selection);
    },
    removeOption(option) {
      this.get('choices').pushObject(option);
      const found = this.get('model.options').findBy('id', option.id);
      this.get('model.options').removeObject(found);
      if (!this.get('model.options').length) this.set('showOptions', false);
    },
    reorder(options) {
      const startIndex = this.get('model.index') + 1;
      options.forEach((option, index) => set(option, 'index', startIndex + index));
      this.set('model.options', options);
    },
    toggle() {
      this.set('showOptions', !this.get('showOptions'));
    }
  }
});
