const MemSecurityCache = require('./mem-auth-state');

const createInitialState = (props) => {
  const state = {
    users: {},
    records: {},
  }
  Object.keys(props)
    .forEach(userId => {
      state.users[userId] = {
        records: {},
      };
      props[userId].forEach(record => {
        if (typeof record === 'string') {
          state.users[userId].records[record] = true;
          state.records[record] = { recordId: record, userId };
        } else if (typeof record === 'object') {
          state.users[userId].records[record.recordId] = true;
          state.records[record.recordId] = { ...record, userId };
        }
      });
    });
  return state;
}

describe('mem-auth-state', () => {
  let state;

  beforeEach(() => {
    state = null;
  });

  afterEach(() => {
    if (state) {
      state.destroy();
    }
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('automatically launch state cleanup in a certain interval', (done) => {
    const spy = jest.spyOn(MemSecurityCache.prototype, 'cleanup')
      .mockImplementation(() => {
        done();
        return Promise.resolve();
      })
    state = new MemSecurityCache({ cleanupInterval: 1 });
  });

  it('supports adding of new records', () => {
    const initialState = createInitialState({
      'initial-user': ['initial-user-initial-record'],
    });
    const testExpireAt = (new Date()).getTime() + 1000;
    state = new MemSecurityCache({ initialState });
    return Promise.all([
      state.addRecord({
        userId: 'initial-user',
        recordId: 'initial-user-new-record',
        expireAt: testExpireAt,
        data: { withData: true },
      }),
      state.addRecord({
        userId: 'new-user',
        recordId: 'new-user-record-1',
      }),
      state.addRecord({
        userId: 'new-user',
        recordId: 'new-user-record-2',
        expireAt: testExpireAt,
        data: { alsoWithData: true },
      }),
    ]).then(() => {
      expect(state.getState()).toEqual({
        users: {
          'initial-user': {
            records: {
              'initial-user-initial-record': true,
              'initial-user-new-record': true,
            },
          },
          'new-user': {
            records: {
              'new-user-record-1': true,
              'new-user-record-2': true,
            },
          },
        },
        records: {
          'initial-user-initial-record': {
            userId: 'initial-user',
            recordId: 'initial-user-initial-record',
          },
          'initial-user-new-record': {
            userId: 'initial-user',
            recordId: 'initial-user-new-record',
            expireAt: testExpireAt,
            data: { withData: true },
          },
          'new-user-record-1': {
            userId: 'new-user',
            recordId: 'new-user-record-1',
            expireAt: null,
            data: null,
          },
          'new-user-record-2': {
            userId: 'new-user',
            recordId: 'new-user-record-2',
            expireAt: testExpireAt,
            data: { alsoWithData: true },
          },
        },
      });
    });
  });

  it('supports invalidating of records', () => {
    const initialState = createInitialState({
      'user-1': ['user-1-record-1', 'user-1-record-2'],
      'user-2': ['user-2-record-1'],
    });
    state = new MemSecurityCache({ initialState });
    return Promise.all([
      state.invalidateRecord('user-1-record-1'),
      state.invalidateRecord('user-2-record-1'),
    ]).then(() => {
      expect(state.getState()).toEqual({
        users: {
          'user-1': {
            records: { 'user-1-record-2': true },
          },
          'user-2': {
            records: {},
          },
        },
        records: {
          'user-1-record-2': {
            userId: 'user-1',
            recordId: 'user-1-record-2',
          },
        },
      });
    });
  });

  it('supports invalidating of all records for a certain user', () => {
    const initialState = createInitialState({
      'user-1': ['user-1-record-1', 'user-1-record-2'],
      'user-2': ['user-2-record-1']
    });
    state = new MemSecurityCache({ initialState });
    return state.invalidateUser('user-1')
      .then(() => {
        expect(state.getState()).toEqual({
          users: {
            'user-2': {
              records: { 'user-2-record-1': true },
            },
          },
          records: {
            'user-2-record-1': {
              userId: 'user-2',
              recordId: 'user-2-record-1',
            },
          },
        });
      });
  });

  it('supports requesting of a record by ID', () => {
    const initialState = createInitialState({
      'user-1': ['user-1-record-1', 'user-1-record-2'],
      'user-2': ['user-2-record-1']
    });
    state = new MemSecurityCache({ initialState });
    return state.requestRecord('user-1-record-2')
      .then((record) => {
        expect(record).toEqual({
          recordId: 'user-1-record-2',
          userId: 'user-1',
        });
      });
  });

});
