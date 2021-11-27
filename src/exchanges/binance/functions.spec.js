const {
    createHmacSignature,
    transformOrderForCreation,
} = require('./functions');

describe('createHmacSignature()', () => {
    it('should return valid signature', () => {
        const data = { foo: 'bar' };

        expect(createHmacSignature(data, 'testkey')).toBe(
            'e037a467e455d7847d50df4a6fa3b1c2ebfa4234b19cb7b2a220f1ffbfe9fdb8',
        );
    });
});

describe('transformOrderForCreation()', () => {
    it('should upper case symbols and transform amount', () => {
        const order = {
            symbol: 'BTC/ETH',
            side: 'seLL',
            type: 'market',
            amount: '0.000001',
        };

        const expectation = {
            symbol: 'BTCETH',
            side: 'SELL',
            type: 'MARKET',
            quantity: '0.000001',
        };

        expect(transformOrderForCreation(order)).toMatchObject(expectation);
    });

    it('should add default timeInForce for limit order', () => {
        const order = {
            symbol: 'BTC/ETH',
            side: 'buy',
            type: 'limit',
            amount: '0.001',
        };

        const expectation = {
            symbol: 'BTCETH',
            side: 'BUY',
            type: 'LIMIT',
            quantity: '0.001',
            timeInForce: 'GTC',
        };

        expect(transformOrderForCreation(order)).toMatchObject(expectation);
    });

    it('should pass custom timeInForce for limit order', () => {
        const order = {
            symbol: 'BTC/ETH',
            side: 'buy',
            type: 'limit',
            amount: '0.001',
            timeInForce: 'IOC',
        };

        const expectation = {
            symbol: 'BTCETH',
            side: 'BUY',
            type: 'LIMIT',
            quantity: '0.001',
            timeInForce: 'IOC',
        };

        expect(transformOrderForCreation(order)).toMatchObject(expectation);
    });
});
