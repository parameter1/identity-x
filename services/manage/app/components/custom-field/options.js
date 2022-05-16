import Component from '@ember/component';
import { computed } from '@ember/object';

const { isArray } = Array;

export default Component.extend({
  disabled: false,
  showExternalIds: false,

  choices: computed('options.{@each.index,[]}', 'groups.{@each.index,@each.optionIds.[],[]}', function () {
    const options = this.get('options') || [];
    const groups = this.get('groups') || [];
    return groups.reduce((arr, group) => ([
      ...arr.filter((option) => !group.optionIds.includes(option.id)),
      group,
    ]), options).sort((a, b) => a.index - b.index);
  }),

  disabledOptionIds: computed('groups.{@each.optionIds.[],[]}', function () {
    const groups = this.get('groups') || [];
    return groups.reduce((arr, group) => ([ ...arr, ...group.optionIds ]), []);
  }),

  index: computed('choices.{[],@each.optionIds.[]}', function () {
    const choices = this.get('choices') || [];
    return choices.reduce((n, c) => c.optionIds ? n + 1 + c.optionIds.length : n + 1, 0);
  }),

  init() {
    this._super(...arguments);
    if (!isArray(this.options)) this.set('options', []);
    if (!isArray(this.groups)) this.set('groups', []);
  },

  actions: {
    add() {
      this.options.pushObject({ label: '', index: this.get('index') });
    },
    addGroup() {
      this.groups.pushObject({
        label: '',
        index: this.get('index'),
        optionIds: [],
        __typename: 'SelectFieldOptionGroup',
      });
    },
  },
});
