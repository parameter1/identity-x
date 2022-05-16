import Component from '@ember/component';
import { computed } from '@ember/object';

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

  selectedOptions: computed('model.optionIds.[]', 'options.[]', function() {
    const optionIds = this.get('model.optionIds');
    const options = this.get('options') || [];
    return options.filter((option) => optionIds.includes(option.id));
  }),

  selectableOptions: computed('model.optionIds.[]', 'options.[]', 'disabledOptions.[]', function() {
    const optionIds = this.get('model.optionIds');
    const options = this.get('options') || [];
    const disabledOptions = this.get('disabledOptions') || [];
    const disabledOptionIds = disabledOptions.map((option) => option.id);
    return options.filter((option) => !optionIds.includes(option.id) && !disabledOptionIds.includes(option.id));
  }),

  groupName: computed('label', function() {
    return `group-${this.label}`;
  }),

  init() {
    this._super(...arguments);
    if (!isArray(this.options)) this.set('options', []);
  },

  actions: {
    handleChange(selection) {
      this.set('model.optionIds', selection.map((option) => option.id));
    },
    removeOption(option) {
      this.set('model.optionIds', this.get('model.optionIds').filter((id) => id !== option.id));
    },
    reorder(options) {
      this.set('model.optionIds', options.map((option) => option.id));
    },
    toggle() {
      this.set('showOptions', !this.get('showOptions'));
    }
  }
});
