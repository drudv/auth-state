const ValidationError = require('../errors/validation-error');

module.exports = function validateBoolean(value) {
  if (typeof value !== 'boolean') {
    throw new ValidationError(`Not a boolean value: ${value}`);
  }
  return value;
};
