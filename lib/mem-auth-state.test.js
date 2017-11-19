const MemSecurityCache = require('./mem-auth-state');

describe('mem-security-cache', () => {
  let cache;

  beforeEach(() => {
    cache = null;
  });

  afterEach(() => {
    if (cache) {
      cache.destroy();
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
    cache = new MemSecurityCache({ cleanupInterval: 1 });
  });

  it('can use initial state', () => {
    const initialState = {
      users: {
        'first-user': {
          records: ['first-user-record-1', 'first-user-record-2'],
        },
        'second-user': {
          records: ['second-user-record-1', 'second-user-record-2'],
        }
      },
      records: {
        'first-user-record-1': { userId: 'first-user' },
        'first-user-record-2': { userId: 'first-user' },
        'second-user-record-1': { userId: 'second-user' },
        'second-user-record-2': { userId: 'second-user' },
      },
    };
    cache = new MemSecurityCache({ initialState });
    expect(cache.getState()).toEqual(initialState);
  });
});
