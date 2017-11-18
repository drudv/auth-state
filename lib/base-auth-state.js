
const NotImplementedError = require('./errors/not-implemented-error');
const validateNumber = require('./utils/validate-number');
const validateFunction = require('./utils/validate-function');
const validateBoolean = require('./utils/validate-boolean');

const stub = name => {
  throw new NotImplementedError(`Implement "${name}" in sub-class`);
};

const DEFAULT_CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 min

class BaseAuthState {
  constructor(options) {
    this._options = this.sanitizeOptions(options);
    this.init();
    if (this._options.autoCleanup) {
      this.resumeDelayedCleanup();
    }
  }

  init() {
    return new Promise(() => stub('init'));
  }

  deinit() {
    return new Promise(() => stub('deinit'));
  }

  addRecord({ userId, recordId, expireAt, data }) {
    return new Promise(() => stub('addRecord'));
  }

  requestRecord(recordId) {
    return new Promise(() => stub('requestRecord'));
  }

  requestUserRecords(userId) {
    return new Promise(() => stub('requestUserRecords'));
  }

  invalidateRecord(recordId) {
    return new Promise(() => stub('invalidateRecord'));
  }

  invalidateUser(userId) {
    return new Promise(() => stub('invalidateUser'));
  }

  sanitizeOptions(options) {
    return BaseAuthState.sanitizeBaseOptions(options);
  }

  cleanup() {
    return new Promise(() => stub('cleanup'));
  }

  getStats() {
    return new Promise(() => stub('getStats'));
  }

  getOptions() {
    return this._options;
  }

  stopDelayedCleanup() {
    if (this._cleanupInterval) {
      clearInterval(this._cleanupInterval);
      this._cleanupInterval = null;
    }
  }

  resumeDelayedCleanup() {
    if (!this._cleanupInterval) {
      this._cleanupInterval = setInterval(
        () => {
          this.cleanup()
            .catch((error) => {
              if (this._options.onInternalError) {
                this._options.onInternalError(error);
              } else {
                return Promise.reject(error);
              }
            });
        },
        this._options.cleanupInterval,
      );
    }
  }

  destroy(options) {
    this.stopDelaytedCleanup();
    this.deinit();
  }

  static sanitizeBaseOptions(options) {
    const sanitized = {
      ...options,
      cleanupInconsistency: validateBoolean(
        options.cleanupInconsistency != null
          ? options.cleanupInconsistency
          : true
      ),
      cleanupInterval: validateNumber(
        options.cleanupInterval || DEFAULT_CLEANUP_INTERVAL,
        { min: 0 }
      ),
      autoCleanup: validateBoolean(
        options.autoCleanup != null
          ? options.autoCleanup
          : true
      ),
      onInternalError: options.onInternalError
        ? validateFunction(options.onInternalError)
        : null,
    };
    return sanitized;
  }
}

module.exports = BaseAuthState;
