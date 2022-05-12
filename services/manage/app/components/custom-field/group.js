import Component from '@ember/component';
import { computed } from '@ember/object';

const { isArray } = Array;

export default Component.extend({
  disabled: false,

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

  init() {
    this._super(...arguments);
    if (!isArray(this.options)) this.set('options', []);
  },

  actions: {
    handleChange(selection) {
      this.set('model.optionIds', selection.map((option) => option.id));
    }
  }
});
