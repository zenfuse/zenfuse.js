const utils = require('.');

describe('transfromZenfuseOrder()', () => {
    const { transfromZenfuseOrder } = utils;

    it('should lower case symbols and transform quantity', () => {
        const order = {
            symbol: 'BTC/ETH',
            side: 'seLL',
            type: 'market',
            quantity: 0.000001,
        };

        const expectation = {
            amount: '0.000001',
            source: 'spot-api',
            symbol: 'btceth',
            type: 'sell-market',
        };

        expect(transfromZenfuseOrder(order)).toEqual(expectation);
    });

    it('should add default timeInForce for limit order', () => {
        const order = {
            symbol: 'BTC/USDT',
            side: 'buy',
            type: 'limit',
            quantity: 0.001,
            price: 1235253,
        };

        const expectation = {
            amount: '0.001',
            price: '1235253',
            source: 'spot-api',
            symbol: 'btcusdt',
            type: 'buy-limit',
        };

        expect(transfromZenfuseOrder(order)).toEqual(expectation);
    });

    it('should pass custom timeInForce for limit order', () => {
        const order = {
            symbol: 'ZEFU/USDT',
            side: 'buy',
            type: 'limit',
            quantity: '0.001',
            extra: 'whenhuobi',
        };

        const expectation = {
            amount: '0.001',
            source: 'spot-api',
            symbol: 'zefuusdt',
            type: 'buy-limit',
            extra: 'whenhuobi',
        };

        expect(transfromZenfuseOrder(order)).toEqual(expectation);
    });
});

describe('createHmacSignature()', () => {
    const { createHmacSignature } = utils;

    it('should return valid signature', () => {
        const args = {
            method: 'GET',
            url: '/test/url',
            queryString: new URLSearchParams({
                AccessKeyId: 'sirwhenairdrop',
                SignatureMethod: 'HmacSHA256',
                SignatureVersion: 2,
                Timestamp: '2019-09-01T18:16:16',
            }),
            privateKey: 'someprivatekey',
        };

        expect(
            createHmacSignature(
                args.method,
                args.url,
                args.queryString,
                args.privateKey,
            ),
        ).toBe('dJHp68/PcTyEqQ3o346YSTQNlPn07edHgYRU90qVRtI=');
    });
});
