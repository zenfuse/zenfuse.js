const utils = require('./utils');

describe('linkOriginalPayload()', () => {
    const { linkOriginalPayload } = utils;

    it('should link symbol', () => {
        const payload = { random: Math.random() };
        const object = {};

        linkOriginalPayload(object, payload);

        expect(object[Symbol.for('zenfuse.originalPayload')]).toBeDefined();
        expect(object[Symbol.for('zenfuse.originalPayload')]).toBe(payload);
    });
});

describe('createHmacSignatureDefault()', () => {
    const { createHmacSignatureDefault } = utils;

    it('should return valid signature', () => {
        const params = {
            ts: 1588591511721,
            method: 'GET',
            path: '/api/v5/market/tickers',
        };

        const key = '0b3695c7-94d8-4d9e-8d40-e442a94dd90f';
        const signature = 'MdQTOHiC6aAfDCjy+9ZV4/dqY4tZDpPn5cJrYk7VUxM=';
        const encoding = 'base64';
        const trueSign = createHmacSignatureDefault(params, key, encoding);

        expect(trueSign).toBe(signature);
    });

    it('should return valid signature with body', () => {
        const params = {
            method: 'POST',
            body: {
                market: 'BTC-PERP',
                side: 'buy',
                price: 8500,
                size: 1,
                type: 'limit',
                reduceOnly: false,
                ioc: false,
                postOnly: false,
                clientId: null,
            },
            path: '/api/orders',
            ts: 1588591856950,
        };

        const key = 'T4lPid48QtjNxjLUFOcUZghD7CUJ7sTVsfuvQZF2';
        const signature = 'KDLYU+VdtxX1mqrdlmzcUZE5Z9qL9oeq2EV6WsYJMT4=';
        const encoding = 'base64';
        const trueSign = createHmacSignatureDefault(params, key, encoding);

        expect(trueSign).toBe(signature);
    });
});
