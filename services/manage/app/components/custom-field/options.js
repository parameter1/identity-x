import Component from '@ember/component';

const { isArray } = Array;

export default Component.extend({
  disabled: false,
  showExternalIds: false,


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
