import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  disabled: false,
  showExternalIds: false,

  optionClass: computed('showExternalIds', function() {
    const classes = ['form-control'];
    if (this.showExternalIds) classes.push('border-right');
    return classes.join(' ');
  }),
});
