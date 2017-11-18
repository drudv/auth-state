const MemSecurityCache = require('./mem-security-cache');

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

  it('automatically cleanup state in certain interval', (done) => {
    const mockedCleanup = jest.fn(() => {
      done();
      return Promise.resolve();
    });
    const cache = new MemSecurityCache({
      cleanupInterval: 1,
    });
  });
});
