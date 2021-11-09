import Component from '@ember/component';
import { computed } from '@ember/object';

const { isArray } = Array;

export default Component.extend({
  disabled: false,
  showExternalIds: false,

  optionClass: computed('showExternalIds', function() {
    const classes = ['form-control'];
    if (this.showExternalIds) classes.push('border-right');
    return classes.join(' ');
  }),

  init() {
    this._super(...arguments);
    if (!isArray(this.options)) this.set('options', []);
  },

  actions: {
    add() {
      this.options.pushObject({ label: '' });
    },
  },
});
