
const BaseAuthState = require('./base-auth-state');
const DuplicateRecordError = require('./errors/duplicate-record-error');
const NotFoundError = require('./errors/not-found-error');
const validateMemAuthState = require('./utils/validate-mem-auth-state');

class MemAuthState extends BaseAuthState {

  sanitizeOptions(options) {
    const baseSanitized = BaseAuthState.sanitizeBaseOptions(options);
    return {
      ...baseSanitized,
      initialState: baseSanitized.initialState
        ? validateMemAuthState(baseSanitized.initialState)
        : null,
    };
  }

  init() {
    this._state = this._options.initialState || {
      users: {},
      records: {},
    };
    return Promise.resolve();
  }

  deinit() {
    return Promise.resolve();
  }

  addRecord({ userId, recordId, expireAt = null, data = null }) {
    return new Promise((resolve, reject) => {
      if (recordId in this._state.records) {
        reject(new DuplicateRecordError(`Record ${recordId} is already exist`));
        return;
      }
      this._state.records[recordId] = {
        userId,
        recordId,
        expireAt,
        data,
      };
      const user = this._state.users[userId];
      if (user) {
        user.records[recordId] = true;
      } else {
        this._state.users[userId] = {
          records: { [recordId]: true },
        };
      }
      resolve();
    });
  }

  requestRecord(recordId) {
    return new Promise((resolve, reject) => {
      const record = this._state.records[recordId];
      if (record) {
        return resolve(record);
      }
      reject(new NotFoundError(`No such record: ${recordId}`));
    });
  }

  requestUserRecords(userId) {
    return new Promise((resolve, reject) => {
      const user = this._state.users[userId];
      if (!user) {
        reject(new NotFoundError(`No such user: ${userId}`));
        return;
      }
      return Object.keys(user.records)
        .map(recordId => this._state.records[recordId])
        .filter(Boolean); // remove non-existen records
    });
  }

  invalidateRecord(recordId) {
    return new Promise((resolve) => {
      const record = this._state.records[recordId];
      if (record) {
        const user = this._state.users[record.userId];
        if (user) {
          delete user.records[recordId];
        }
        delete this._state.records[recordId];
      }
      resolve();
    });
  }

  invalidateUser(userId) {
    return new Promise((resolve) => {
      const user = this._state.users[userId];
      if (user) {
        Object.keys(user.records)
          .forEach((recordId) => {
            delete this._state.records[recordId];
          });
        delete this._state.users[userId];
      }
      resolve();
    });
  }

  cleanup() {
    return new Promise((resolve, reject) => {
      const users = this._state.users;
      const records = this._state.records;
      const now = (new Date).getTime();
      let recordsToRemove = [];

      // for-in loop is used for performance
      //  @see: https://jsperf.com/object-keys-vs-for-in-ext
      for (var recordId in records) {

        // hasOwnProperty check is not necessary,
        //  since all enumerable properties should be own here
        const record = records[recordId];

        if (!record) {
          recordsToRemove.push(recordId);
          continue;
        }

        if (record.expireAt && record.expireAt < now) {
          try {
            delete user[record.userId].records[recordId];
          } catch (error) {
            if (!(error instanceof TypeError)) { // skip non-existent users
              reject(error);
            }
          }
          recordsToRemove.push(recordId);
        }
      }

      if (this._options.cleanupInconsistency) {
        const usersToRemove = [];

        // @see comments above for for-in loop and hasOwnProperty check
        for (var userId in users) {
          const user = users[userId];
          if (!userId) {
            usersToRemove.push(user);
          }

          const userRecordsToRemove = [];

          for (var recordId in user.records) {
            if (!records[recordId]) {
              userRecordsToRemove.push(recordId);
            }
          }

          if (userRecordsToRemove.length) {
            recordsToRemove = recordsToRemove.concat(userRecordsToRemove);
          }
        }
      }

      recordsToRemove.forEach(recordId => {
        delete this.records[recordId];
      });
    });
  }

  getState() {
    return this._state;
  }

  getStats() {
    return Promise.resolve({
      users: Object.keys(this._state.users).length,
      records: Object.keys(this._state.records).length,
    });
  }
}

module.exports = MemAuthState;
