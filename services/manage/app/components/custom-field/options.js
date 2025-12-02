import Component from '@ember/component';
import { computed } from '@ember/object';

const { isArray } = Array;

export default Component.extend({
  disabled: false,
  showExternalIds: false,

  disabledOptionIds: computed('choices.{@each.options,[]}', function () {
    const choices = this.get('choices') || [];
    return choices.reduce((arr, group) => ([ ...arr, ...(group.options ? [...group.options.map(o => o.id)] : []) ]), []);
  }),

  isAddGroupDisabled: computed('disabled', 'options.{@each.id,[]}', function() {
    const disabled = this.get('disabled');
    if (disabled) return true;
    const options = this.get('options') || [];
    const found = options.find(o => o.id);
    return !found;
  }),

  index: computed('choices.{[],@each.optionIds}', function () {
    const choices = this.get('choices') || [];
    return choices.reduce((n, c) => c.options ? n + 1 + c.options.length : n + 1, 0);
  }),

  init() {
    this._super(...arguments);
    if (!isArray(this.options)) this.set('options', []);
    if (!isArray(this.groups)) this.set('groups', []);
  },

  actions: {
    add() {
      this.choices.pushObject({
        label: '',
        index: this.get('index'),
        canSelect: true,
        __typename: 'SelectFieldOption',
      });
    },
    addGroup() {
      this.choices.pushObject({
        label: '',
        index: this.get('index'),
        optionIds: [],
        __typename: 'SelectFieldOptionGroup',
      });
    },
  },
});
