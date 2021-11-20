const {
    createHmacSignature,
    transformOrderForCreation,
    getAllTickersFromSymbols,
    getOnlySpotMarkets,
    structualizeMarkets,
} = require('./functions');

describe('createHmacSignature()', () => {
    it('should return valid signature', () => {
        const data = { foo: 'bar' };

        expect(createHmacSignature(data, 'testkey')).toBe(
            'e037a467e455d7847d50df4a6fa3b1c2ebfa4234b19cb7b2a220f1ffbfe9fdb8',
        );
    });
});
