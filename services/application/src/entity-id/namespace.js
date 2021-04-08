const formatValue = require('./format-value');

class Namespace {
  /**
   * Invalid characters: `.` `*` `~`
   *
   * Falsy values and `_` will be treated as `null`
   *
   * @param {object} namespace
   * @param {string} [namespace.provider]
   * @param {string} [namespace.tenant]
   * @param {string} namespace.type
   */
  constructor({ provider, tenant, type } = {}) {
    this.provider = formatValue(provider);
    this.tenant = formatValue(tenant);
    this.type = formatValue(type);
    if (!this.type) throw new Error('The entity namespace `type` is required.');
  }

  /**
   *
   */
  toString() {
    const { provider, tenant, type } = this;
    return [provider, tenant, type].map(v => v || '_').join('.');
  }

  /**
   *
   */
  static parse(str) {
    if (!str) throw new Error('Unable to parse entity namespace: no value provided.');
    const [provider, tenant, type] = str.split('.');
    return new Namespace({ provider, tenant, type });
  }

  /**
   *
   */
  static make(value) {
    if (!value) throw new Error('Unable to make entity namespace: no value was provided.');
    if (value instanceof Namespace) return value;
    if (typeof value === 'string') return Namespace.parse(value);
    return new Namespace(value);
  }
}

module.exports = Namespace;
