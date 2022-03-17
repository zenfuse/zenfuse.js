const utils = require('.');

describe('createHmacSignature()', () => {
    const { createHmacSignature } = utils;

    it('should return valid signature', () => {
        const params = {
            apiKey: '484bd71d59d5ed29ff3c27a6d0c6754c',
            ts: 1588591511721,
            msgNo: 1,
        };

        const key = 'T4lPid48QtjNxjLUFOcUZghD7CUJ7sTVsfuvQZF2';
        const madeSign = createHmacSignature(params, key);
        const signature =
            '31dac2c4416eb03c6ef5e81aa40716b71ad116ce896645bd35cba38ab4287696';

        expect(madeSign).toBe(signature);
    });
});

describe('transformZenfuseOrder()', () => {
    const { transformZenfuseOrder } = utils;

    it('should transform limit order', () => {
        const order = {
            id: '123',
            timestamp: 1588591856950,
            status: 'open',
            symbol: 'BTC/ETH',
            side: 'buy',
            type: 'limit',
            price: 69.6969,
            quantity: 0.02323,
        };

        const expectation = {
            id: '123',
            timestamp: 1588591856950,
            status: 'open',
            symbol: 'BTC-ETH',
            side: 'buy',
            type: 'limit',
            price: '69.6969',
            quantity: '0.02323',
        };

        expect(transformZenfuseOrder(order)).toStrictEqual(expectation);
    });
});

describe('transformBithumbOrder()', () => {
    const { transformBithumbOrder } = utils;

    const OrderSchema = require('../../../base/schemas/openOrder');

    it('should transform created order', () => {
        const zenfuseCreatedOrder = {
            id: '123',
            timestamp: 1588591856950,
            status: 'open',
            symbol: 'BTC/ETH',
            side: 'buy',
            type: 'limit',
            price: 69.6969,
            quantity: 0.02323,
        };
        const receivedBithumbOrder = {
            data: {
                orderId: '23132134242',
                symbol: 'BTC-ETH',
            },
            code: '0',
            msg: 'success',
            timestamp: 1551346473238,
            params: [],
        };

        const result = transformBithumbOrder(
            receivedBithumbOrder,
            zenfuseCreatedOrder,
        );

        expect(result).toMatchSchema(OrderSchema);
    });

    it('should transform fetched order', () => {
        const receivedBithumbOrder = {
            data: {
                orderId: '12300993210',
                symbol: 'BTC-USDT',
                price: '3700',
                tradedNum: '0.01',
                quantity: '0.5',
                avgPrice: '0',
                status: 'pending',
                type: 'limit',
                side: 'buy',
                createTime: '1552878781',
                tradeTotal: '0.5',
            },
            code: '0',
            msg: 'success',
            timestamp: 1551346473238,
            params: [],
        };

        const result = transformBithumbOrder(receivedBithumbOrder);

        expect(result).toMatchSchema(OrderSchema);
    });
});
