const BitglobalBase = require('./base');

describe('createHmacSignatureBitglobal()', () => {
    it('should return valid signature', () => {
        const params = {
            apiKey: '484bd71d59d5ed29ff3c27a6d0c6754c',
            ts: 1588591511721,
            msgNo: 1,
        };

        const key = 'T4lPid48QtjNxjLUFOcUZghD7CUJ7sTVsfuvQZF2';
        const encoding = 'hex';
        const madeSign = BitglobalBase.prototype.createHmacSignatureBitglobal(
            params,
            key,
            encoding,
        );
        const signature =
            '9c5bd5874218fb8ed252b8c14e411600b6be3f53d56c266224131c545dfca0e4';

        expect(madeSign).toBe(signature);
    });
});

describe('transformZenfuseOrder()', () => {
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

        expect(
            BitglobalBase.prototype.transformZenfuseOrder(order),
        ).toStrictEqual(expectation);
    });
});

describe('transformBitglobalOrder()', () => {
    const OrderSchema = require('../../base/schemas/openOrder');

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
        const receivedBitglobalOrder = {
            data: {
                orderId: '23132134242',
                symbol: 'BTC-ETH',
            },
            code: '0',
            msg: 'success',
            timestamp: 1551346473238,
            params: [],
        };

        const result = BitglobalBase.prototype.transformBitglobalOrder(
            receivedBitglobalOrder,
            zenfuseCreatedOrder,
        );

        expect(result).toMatchSchema(OrderSchema);
    });

    it('should transform fetched order', () => {
        const receivedBitglobalOrder = {
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

        const result = BitglobalBase.prototype.transformBitglobalOrder(
            receivedBitglobalOrder,
        );

        expect(result).toMatchSchema(OrderSchema);
    });
});
