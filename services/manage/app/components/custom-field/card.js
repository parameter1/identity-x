import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  tagName: '',

  options: computed('field.options.[]', function() {
    const options = this.get('field.options');
    return options ? options.map((option) => option.label) : null;
  }),

  type: computed('field.__typename', function() {
    return this.get('field.__typename').replace(/Field$/, '');
  }),
});
