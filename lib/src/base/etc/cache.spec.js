const BaseGlobalCache = require('./cache');

describe('BaseGlobalCache class', () => {
    it('create a new instance', () => {
        const instance = new BaseGlobalCache('jest');

        expect(instance).toBeDefined();
        expect(instance.globalCache).toBeDefined();
        expect(instance.globalCache).toBeInstanceOf(Map);
    });

    it('should refer to same instance', () => {
        const first = new BaseGlobalCache('jest');
        const second = new BaseGlobalCache('jest');

        expect(first.globalCache).toBe(second.globalCache);

        first.globalCache.foo = 'foo';

        expect(first.globalCache.foo).toBe(second.globalCache.foo);
        expect(second.globalCache.foo).toBe('foo');

        second.globalCache.foo = 'bar';

        expect(first.globalCache.foo).toBe('bar');
    });

    it('should update timestamp on update', () => {
        const time = new Date('2001-04-16').getTime();
        jest.useFakeTimers().setSystemTime(time);

        const instance = new BaseGlobalCache('jest');

        expect(instance.globalCache.lastUpdateTimestamp).toBe(0);

        instance.globalCache.set('jest', 'some value');

        expect(instance.globalCache.get('jest')).toBe('some value');

        expect(instance.globalCache.lastUpdateTimestamp).toBe(time);
    });

    it('should use isExpired', () => {
        const instance = new BaseGlobalCache('isExpired');

        expect(instance.isExpired).toBe(true);

        instance.globalCache.set('jest', 'jest');

        expect(instance.isExpired).toBe(false);
    });
});
