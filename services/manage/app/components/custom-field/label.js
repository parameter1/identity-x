import Component from '@ember/component';
import { computed } from '@ember/object';
import { htmlSafe } from '@ember/template';

export default Component.extend({
  tagName: '',

  label: computed('value', function () {
    return htmlSafe(this.get('value'));
  }),
});
