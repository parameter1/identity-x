import { helper } from '@ember/component/helper';

export default helper(([arr, prop, value]) => arr.findBy(prop, value));
