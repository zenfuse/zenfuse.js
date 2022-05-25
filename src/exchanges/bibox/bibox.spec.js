const BiboxBase = require('./base');

describe('transformZenfuseOrder()', () => {
    it('should upper case symbols and transform amount', () => {
        const order = {
            symbol: 'BTC/ETH',
            side: 'seLL',
            type: 'market',
            quantity: '0.000001',
        };

        const expectation = {
            pair: 'BTC_ETH',
            order_side: 'SELL',
            order_type: 'MARKET',
            amount: '0.000001',
        };

        expect(BiboxBase.prototype.transformZenfuseOrder(order)).toEqual(
            expectation,
        );
    });
});

describe('transformBiboxOrder()', () => {
    const OrderSchema = require('../../base/schemas/openOrder').omit({
        symbol: true,
    });

    it('should transform order', () => {
        const biboxCreatedOrder = {
            id: "12874181782731851",
            createdAt: 1604309861000,
            account_type: 0,
            pair: "BIX_USDT",
            coin_symbol: "BIX",
            currency_symbol: "USDT",
            order_side: 2,
            order_type: 2,
            price: "0.054330",
            deal_price: "0.000000",
            amount: "100.0000",
            money: "5.43300000",
            deal_amount: "0.0000",
            deal_percent: "0.00%",
            deal_money: "0.00000000",
            deal_count: 0,
            status: 1,
            unexecuted: "100.0000"
        };

        expect(
            BiboxBase.prototype.transformBiboxOrder(biboxCreatedOrder),
        ).toMatchSchema(OrderSchema);
    });
});
