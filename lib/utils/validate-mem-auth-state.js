const ValidationError = require('../errors/validation-error');

module.exports = function validateMemAuthState(value) {
  try {
    if (typeof value !== 'object') {
      throw new ValidationError(`Not an object: ${value}`);
    }
    if (typeof value.users !== 'object') {
      throw new ValidationError(`'state.users' is not an object: ${value.users}`);
    }
    Object.keys(value.users)
      .forEach((key) => {
        const user = value.users[key];
        if (typeof user !== 'object') {
          throw new ValidationError(`'state.users["${key}"]' is not an object: ${user}`);
        }
        if (typeof user.records !== 'object') {
          throw new ValidationError(`'state.users["${key}"].records' is not an object: ${user.records}`);
        }
      });
    if (typeof value.records !== 'object') {
      throw new ValidationError(`'state.records' is not an object: ${value.users}`);
    }
    Object.keys(value.records)
      .forEach((key) => {
        const record = value.records[key];
        if (typeof record !== 'object') {
          throw new ValidationError(`'state.records["${key}"]' is not an object: ${record}`);
        }
        if (typeof record.userId !== 'string') {
          throw new ValidationError(`'state.records["${key}"].userId' is not a string: ${record.userId}`);
        }
        if (record.expireAt != null && typeof record.expireAt !== 'number') {
          throw new ValidationError(`'state.records["${key}"].expireAt' is not a number: ${record.expireAt}`);
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
