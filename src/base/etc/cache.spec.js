const { getCacheInstance } = require('./cache');

describe('Zenfuse global cache', () => {
    it('create a new instance', () => {
        const globalCache = getCacheInstance('jest');

        expect(globalCache).toBeDefined();
    });

    it('should refer to same instance', () => {
        const first = getCacheInstance('jest');
        const second = getCacheInstance('jest');

        expect(first).toBe(second);

        first.foo = 'foo';

        expect(first.foo).toBe(second.foo);
        expect(second.foo).toBe('foo');

        second.foo = 'bar';

        expect(first.foo).toBe('bar');
    });
});
