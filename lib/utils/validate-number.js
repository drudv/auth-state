const ValidationError = require('../errors/validation-error');

module.exports = function validateNumber(value, options = {}) {
  if (typeof value !== 'number') {
    throw new ValidationError(`Not a number: ${value}`);
  }
  if (options.min != null && options.min > value) {
    throw new ValidationError(`${value} should not be lower than ${options.min}`);
  }
  if (options.max != null &&  value > options.max) {
    throw new ValidationError(`${value} should not be higher than ${options.max}`);
  }
  return value;
};
