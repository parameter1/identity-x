const { Schema } = require('mongoose');

module.exports = new Schema({
  value: {
    type: Boolean,
    default: false,
  },
});
