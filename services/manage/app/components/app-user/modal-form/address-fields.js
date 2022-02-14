import Component from '@ember/component';

export default Component.extend({
  init() {
    this._super(...arguments);
    if (!this.model) this.set('model', {});
  },

  actions: {
    setCountryCode(countryCode) {
      this.set('model.countryCode', countryCode);
      this.send('setRegionCode', '');
    },

    setRegionCode(regionCode) {
      this.set('model.regionCode', regionCode);
      this.set('model.postalCode', '');
    },
  },
});
