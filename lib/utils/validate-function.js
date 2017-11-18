const ValidationError = require('../errors/validation-error');

module.exports = function validateFunction(value) {
  if (typeof value !== 'function') {
    throw new ValidationError(`Not a function: ${value}`);
  }
  return value;
};
