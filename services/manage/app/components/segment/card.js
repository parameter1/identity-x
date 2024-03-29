import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  tagName: '',

  rules: computed.mapBy('segment.rules', 'name'),
});
