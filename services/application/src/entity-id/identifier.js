const formatValue = require('./format-value');

class Identifier {
  /**
   *
   * @param {object} identifier
   * @param {string} identifier.value
   * @param {string} [identifier.type]
   */
  constructor({ value, type } = {}) {
    this.value = formatValue(value);
    this.type = formatValue(type);
    if (!this.value) throw new Error('The identifier `value` is required.');
  }

  /**
   *
   */
  toString() {
    const { value, type } = this;
    return [value, type].filter(v => v).join('~');
  }

  /**
   *
   */
  static parse(str) {
    if (!str) throw new Error('Unable to parse entity identifier: no value provided.');
    const [value, type] = `${str}`.trim().split('~');
    return new Identifier({ value, type });
  }

  static make(value) {
    if (!value) throw new Error('Unable to make entity identifier: no value was provided.');
    if (value instanceof Identifier) return value;
    if (typeof value === 'string') return Identifier.parse(value);
    return new Identifier(value);
  }
}

module.exports = Identifier;
