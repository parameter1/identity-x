import Component from '@ember/component';

export default Component.extend({
  init() {
    this._super(...arguments);
    if (!this.model) this.set('model', {});
  },

  actions: {
    setLanguage(language) {
      this.set('model.language', language);
    },
  },
});
