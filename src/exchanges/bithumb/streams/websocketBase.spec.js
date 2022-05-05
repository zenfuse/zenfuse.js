const BithumbWsBase = require('./websocketBase');

it('should transform WS format order', () => {
    const OrderSchema = require('../../../base/schemas/openOrder');

    const receivedBithumbOrder = {
        code: '00007',
        data: {
            cancelQuantity: '10060.7',
            dealPrice: '0',
            dealQuantity: '0',
            dealVolume: '0',
            fee: '0',
            feeType: '',
            oId: '69663509668139008',
            price: '100.607',
            quantity: '100',
            side: 'buy',
            status: 'canceled',
            symbol: 'BTC-USDT',
            time: 1560758352705,
            type: 'limit',
        },
        topic: 'ORDER',
        timestamp: 1560758352743,
    };

    const result =
        BithumbWsBase.prototype.transformBithumbOrderWS(receivedBithumbOrder);

    expect(result).toMatchSchema(OrderSchema);
});
