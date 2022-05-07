const FtxBase = require('./base');

describe('transformZenfuseOrder()', () => {
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

        expect(FtxBase.prototype.transformZenfuseOrder(order)).toStrictEqual(
            expectation,
        );
    });
});

describe('transformFtxOrder()', () => {
    const OrderSchema = require('../../base/schemas/openOrder');

    it('should transform order', () => {
        const ftxCreatedOrder = {
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

        const result = FtxBase.prototype.transformFtxOrder(ftxCreatedOrder);

        expect(result).toMatchSchema(OrderSchema);
    });
});
