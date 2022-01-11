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

describe('transfromZenfuseOrder()', () => {
    const { transfromZenfuseOrder } = utils;

    it('should transform limit order', () => {
        const order = {
            symbol: 'BTC/ETH',
            side: 'buy',
            type: 'limit',
            price: 69.6969,
            quantity: 0.02323,
            extra: 'whenbinance',
        };

        const expectation = {
            market: 'BTC/ETH',
            side: 'buy',
            type: 'limit',
            price: 69.6969,
            size: 0.02323,
            extra: 'whenbinance',
        };

        expect(transfromZenfuseOrder(order)).toStrictEqual(expectation);
    });
});

describe('transformFtxOrder()', () => {
    const { transfromFtxOrder } = utils;

    const orderSchema = {
        type: 'object',
        properties: {
            id: {
                type: 'string',
            },
            timestamp: {
                type: 'number',
            },
            status: {
                type: 'string',
                tags: ['open', 'close', 'canceled'],
            },
            symbol: {
                type: 'string',
            },
            type: {
                type: 'string',
                tags: ['market', 'limit'],
            },
            side: {
                type: 'string',
                tags: ['buy', 'sell'],
            },
            price: {
                type: ['number', 'string'],
            },
            quantity: {
                type: ['number', 'string'],
            },
        },
        additionalProperties: false,
        minProperties: 8,
    };

    it('should transform order', () => {
        const ftxCreatedOrder = {
            createdAt: '2019-03-05T09:56:55.728933+00:00',
            filledSize: 0,
            future: 'XRP-PERP',
            id: 9596912,
            market: 'XRP-PERP',
            price: 0.306525,
            remainingSize: 31431,
            side: 'sell',
            size: 31431,
            status: 'open',
            type: 'limit',
            reduceOnly: false,
            ioc: false,
            postOnly: false,
            clientId: null,
        };

        const result = transfromFtxOrder(ftxCreatedOrder);

        expect(result).toMatchSchema(orderSchema);
    });
});
