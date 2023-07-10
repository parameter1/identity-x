import Component from '@ember/component';

export default Component.extend({
  init() {
    this._super(...arguments);
    if (!this.model) this.set('model', {});
    if (!this.model.loginLinkTemplate) this.set('model.loginLinkTemplate', {});
  },

  actions: {
    setLanguage(language) {
      this.set('model.language', language);
    },
  },
});
