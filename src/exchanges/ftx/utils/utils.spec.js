const utils = require('.');

describe('createHmacSignature()', () => {
    const { createHmacSignature } = utils;

    it('should return valid signature', () => {
        const params = {
            ts: 1588591511721,
            method: 'GET',
            path: '/api/markets',
        };

        const key = 'T4lPid48QtjNxjLUFOcUZghD7CUJ7sTVsfuvQZF2';
        const signature =
            'dbc62ec300b2624c580611858d94f2332ac636bb86eccfa1167a7777c496ee6f';

        expect(createHmacSignature(params, key)).toBe(signature);
    });

    it('should return valid signature with body', () => {
        const params = {
            method: 'POST',
            body: '{"market": "BTC-PERP", "side": "buy", "price": 8500, "size": 1, "type": "limit", "reduceOnly": false, "ioc": false, "postOnly": false, "clientId": null}',
            path: '/api/orders',
            ts: 1588591856950,
        };

        const key = 'T4lPid48QtjNxjLUFOcUZghD7CUJ7sTVsfuvQZF2';
        const signature =
            'c4fbabaf178658a59d7bbf57678d44c369382f3da29138f04cd46d3d582ba4ba';

        expect(createHmacSignature(params, key)).toBe(signature);
    });
});
