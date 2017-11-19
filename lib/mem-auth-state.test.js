const MemSecurityCache = require('./mem-auth-state');

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

  it('supports initial state', () => {
    const initialState = {
      users: {
        'first-user': {
          records: {
            'first-user-record-1': true,
            'first-user-record-2': true,
          },
        },
        'second-user': {
          records: {
            'second-user-record-1': true,
            'second-user-record-2': true,
          },
        }
      },
      records: {
        'first-user-record-1': { userId: 'first-user' },
        'first-user-record-2': { userId: 'first-user' },
        'second-user-record-1': { userId: 'second-user' },
        'second-user-record-2': { userId: 'second-user' },
      },
    };
    state = new MemSecurityCache({ initialState });
    expect(state.getState()).toEqual(initialState);
  });

  it('supports adding of new records', () => {
    const initialState = {
      users: {
        'initial-user': {
          records: { 'initial-user-initial-record': true },
        },
      },
      records: {
        'initial-user-initial-record': { userId: 'initial-user' },
      },
    };
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
          'initial-user-initial-record': { userId: 'initial-user' },
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

});
