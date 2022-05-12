import Component from '@ember/component';
import { computed } from '@ember/object';

const { isArray } = Array;

export default Component.extend({
  disabled: false,

  // eslint-disable-next-line ember/use-brace-expansion
  disabledOptions: computed('options.[]', 'groups.[]', 'groups.@each.optionIds.[]', function() {
    const groups = this.get('groups') || [];
    const options = this.get('options') || [];
    const selected = groups.reduce((arr, group) => ([...arr, ...group.optionIds]), []);
    return options.filter((option) => selected.includes(option.id));
  }),

  init() {
    this._super(...arguments);
    if (!isArray(this.groups)) this.set('groups', []);
    if (!isArray(this.options)) this.set('options', []);
  },

  actions: {
    add() {
      this.groups.pushObject({ label: '', optionIds: [] });
    },
  },
});
