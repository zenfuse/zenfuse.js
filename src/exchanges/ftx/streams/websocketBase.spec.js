const FtxWsBase = require('./websocketBase');

describe('transformFtxOrder()', () => {
    const OrderSchema = require('../../../base/schemas/openOrder');

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

        const result = FtxWsBase.prototype.transformFtxOrder(ftxCreatedOrder);

        expect(result).toMatchSchema(OrderSchema);
    });
});
