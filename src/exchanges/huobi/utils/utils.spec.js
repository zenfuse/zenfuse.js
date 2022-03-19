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
        const signature =
            '2832d853e55db715f59aaadd966cdc51913967da8bf687aad8457a5ac609313e';

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
            extra: 'whenhuobi',
        };

        const expectation = {
            market: 'BTC/ETH',
            side: 'buy',
            type: 'limit',
            price: 69.6969,
            size: 0.02323,
            extra: 'whenhuobi',
        };

        expect(transfromZenfuseOrder(order)).toStrictEqual(expectation);
    });
});

describe('transformHuobiOrder()', () => {
    const { transfromHuobiOrder } = utils;

    const OrderSchema = require('../../../base/schemas/openOrder');

    it('should transform order', () => {
        const huobiCreatedOrder = {
            createdAt: '2019-03-05T09:56:55.728933+00:00',
            filledSize: 0,
            id: 9596912,
            market: 'ZEFU/USDT',
            price: 10,
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

        const result = transfromHuobiOrder(huobiCreatedOrder);

        expect(result).toMatchSchema(OrderSchema);
    });
});
