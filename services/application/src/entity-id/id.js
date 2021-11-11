const Identifier = require('./identifier');
const Namespace = require('./namespace');

class EntityID {
  /**
   *
   * @param {object|string|Identifier} identifier
   * @param {object|string|Namespace} namespace
   */
  constructor(identifier, namespace) {
    this.identifier = Identifier.make(identifier);
    this.namespace = Namespace.make(namespace);
  }

  /**
   *
   */
  toString() {
    const { identifier, namespace } = this;
    return [namespace, identifier].map(v => `${v}`).join('*');
  }

  toNamespaceIdentifier() {
    const ns = this.namespace.toString();
    const { type } = this.identifier;
    return type ? `${ns}~${type}` : ns;
  }

  /**
   *
   */
  static parse(str) {
    if (!str) throw new Error('Unable to parse entity ID: no value provided.');
    const [namespace, identifier] = str.split('*');
    return new EntityID(identifier, namespace);
  }

  /**
   *
   */
  static make(value) {
    if (!value) throw new Error('Unable to make entity ID: no value was provided.');
    if (value instanceof EntityID) return value;
    if (typeof value === 'string') return EntityID.parse(value);
    return new EntityID(value.identifier, value.namespace);
  }
}

module.exports = EntityID;
