import Component from '@ember/component';
import { computed } from '@ember/object';
import ActionMixin from '@identity-x/manage/mixins/action-mixin';

export default Component.extend(ActionMixin, {
  hasInitial: computed('externalId.id', function() {
    return Boolean(this.get('externalId.id'));
  }),
  hasData: computed('hasInitialExternalId', 'externalId.namespace.{provider,tenant,type}', 'externalId.identifier.value', function() {
    if (this.hasInitialExternalId) return true;
    if (this.get('externalId.identifier.value')) return true;
    return ['provider', 'tenant', 'key'].some((key) => Boolean(this.get(`externalId.namespace.${key}`)));
  }),

  isShowing: false,

  init() {
    this._super(...arguments);
    if (!this.externalId) this.set('externalId', {
      namespace: {},
      identifier: {},
    });
    if (this.hasInitial) this.show();
  },

  clear() {
    this.set('isShowing', false);
    this.set('externalId', {
      namespace: {},
      identifier: {},
    });
    this.sendEventAction('on-clear');
  },

  show() {
    this.set('isShowing', true);
    this.sendEventAction('on-show');
  },

  actions: {
    add() {
      this.show();
    },
    remove() {
      if (!this.hasData) return this.clear();
      if (confirm('Are you sure you want to remove the External ID? This will clear ALL associated values.')) {
        this.clear();
      }
    },
  },
});
