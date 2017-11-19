const ValidationError = require('../errors/validation-error');
const validatePlainObject = require('./validate-plain-object');

module.exports = function validateMemAuthState(value) {
  try {
    if (typeof value !== 'object') {
      throw new ValidationError(`Not an object: ${value}`);
    }
    if (typeof value.users !== 'object') {
      throw new ValidationError(
        `'state.users' is not an object: ${value.users}`
      );
    }
    Object.keys(value.users)
      .forEach((key) => {
        const user = value.users[key];
        validatePlainObject(user, `'state.users["${key}"]'`);
        validatePlainObject(user.records, `'state.users["${key}"].records'`);
      });
    validatePlainObject(value.records, `'state.records'`);
    Object.keys(value.records)
      .forEach((key) => {
        const record = value.records[key];
        validatePlainObject(record, `'state.records["${key}"]'`);
        if (!['string', 'number'].includes(typeof record.userId)) {
          throw new ValidationError(
            `'state.records["${key}"].userId' is not a string or number: ${record.userId}`
          );
        }
        if (('' + record.recordId) !== key) {
          throw new ValidationError(
            `'state.records["${key}"].recordId' (value: ${record.recordId}) doesn't satisfy record key: ${key}`
          );
        }
        if (record.expireAt != null && typeof record.expireAt !== 'number') {
          throw new ValidationError(
            `'state.records["${key}"].expireAt' is not a number: ${record.expireAt}`
          );
        }
      });
  } catch (e) {
    throw new ValidationError(`Wrong mem auth state: ${e.message}`);
  };
  if (typeof value !== 'object') {
    throw new ValidationError(`Not an object: ${value}`);
  }
  return value;
};
