import Component from '@ember/component';

export default Component.extend({
  init() {
    this._super(...arguments);
    if (!this.model) this.set('model', {});
  },

  actions: {
    setAccessLevels(accessLevels) {
      this.set('model.accessLevels', accessLevels);
    },

    setTeams(teams) {
      this.set('model.teams', teams);
    },
  },
});
