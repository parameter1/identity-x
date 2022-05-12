import Component from '@ember/component';
import { computed } from '@ember/object';

const { isArray } = Array;

export default Component.extend({
  disabled: false,

  selectedOptions: computed('model.optionIds.[]', function() {
    const optionIds = this.get('model.optionIds');
    const options = this.get('options') || [];
    return options.filter((option) => optionIds.includes(option.id));
  }),

  formattedOptions: computed('options.[]', function() {
    const optionIds = this.get('model.optionIds');
    return this.get('options').filter((option) => option.id && !optionIds.includes(option.id));
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
