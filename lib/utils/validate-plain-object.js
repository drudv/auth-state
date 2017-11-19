const ValidationError = require('../errors/validation-error');

module.exports = function validatePlainObject(value, name = 'value') {
  if (Object.prototype.toString.call(value) !== '[object Object]') {
    throw new ValidationError(`${name} is not a plain object: ${value}`);
  }
  return value;
};
