const BinanceSpot = require('./spot');

describe('transformZenfuseOrder()', () => {
    it('should upper case symbols and transform amount', () => {
        const order = {
            symbol: 'BTC/ETH',
            side: 'seLL',
            type: 'market',
            quantity: '0.000001',
        };

        const expectation = {
            symbol: 'BTCETH',
            side: 'SELL',
            type: 'MARKET',
            quantity: '0.000001',
        };

        expect(BinanceSpot.prototype.transformZenfuseOrder(order)).toEqual(
            expectation,
        );
    });

    it('should add default timeInForce for limit order', () => {
        const order = {
            symbol: 'BTC/ETH',
            side: 'buy',
            type: 'limit',
            quantity: '0.001',
        };

        const expectation = {
            symbol: 'BTCETH',
            side: 'BUY',
            type: 'LIMIT',
            quantity: '0.001',
        };

        expect(BinanceSpot.prototype.transformZenfuseOrder(order)).toEqual(
            expectation,
        );
    });

    it('should pass custom timeInForce for limit order', () => {
        const order = {
            symbol: 'BTC/ETH',
            side: 'buy',
            type: 'limit',
            quantity: '0.001',
            extra: 'whenbinance',
        };

        const expectation = {
            symbol: 'BTCETH',
            side: 'BUY',
            type: 'LIMIT',
            quantity: '0.001',
            extra: 'whenbinance',
        };

        expect(BinanceSpot.prototype.transformZenfuseOrder(order)).toEqual(
            expectation,
        );
    });
});

describe('transformBinanceOrder()', () => {
    const OrderSchema = require('../../../base/schemas/openOrder').omit({
        symbol: true,
    });

    it('should transform order', () => {
        const binanceCreatedOrder = {
            symbol: 'BNBUSDT',
            orderId: 5114608,
            orderListId: -1,
            clientOrderId: 'nVuwTgVfxQtsMV9uuMMXxL',
            transactTime: 1637596926709,
            price: '0.00000000',
            origQty: '1.00000000',
            executedQty: '1.00000000',
            cumulativeQuoteQty: '1.00000000',
            status: 'FILLED',
            timeInForce: 'GTC',
            type: 'MARKET',
            side: 'BUY',
            fills: [
                {
                    price: '576.30000000',
                    qty: '0.77000000',
                    commission: '0.00000000',
                    commissionAsset: 'BNB',
                    tradeId: 239238,
                },
                {
                    price: '577.00000000',
                    qty: '0.23000000',
                    commission: '0.00000000',
                    commissionAsset: 'BNB',
                    tradeId: 239239,
                },
            ],
        };

        expect(
            BinanceSpot.prototype.transformBinanceOrder(binanceCreatedOrder),
        ).toMatchSchema(OrderSchema);
    });
});

describe('assignDefaultsInOrder()', () => {
    const DEFAULTS = {
        limit: {
            timeInForce: 'GTC',
        },
        market: {},
    };

    it('should add default timeInForce for limit order', () => {
        const order = {
            symbol: 'BTC/ETH',
            side: 'buy',
            type: 'limit',
            quantity: '0.001',
        };

        const expectation = {
            symbol: 'BTC/ETH',
            side: 'buy',
            type: 'limit',
            quantity: '0.001',
            timeInForce: 'GTC',
        };

        const output = BinanceSpot.prototype.assignDefaultsInOrder(
            order,
            DEFAULTS,
        );

        expect(output).toMatchObject(expectation);
        expect(output.timeInForce).toBe(expectation.timeInForce);
    });

    it('should add defaults for market order', () => {
        const order = {
            symbol: 'BTCETH',
            side: 'BUY',
            type: 'MARKET',
            quantity: '0.001',
        };

        const expectation = {
            symbol: 'BTCETH',
            side: 'BUY',
            type: 'MARKET',
            quantity: '0.001',
        };

        const output = BinanceSpot.prototype.assignDefaultsInOrder(
            order,
            DEFAULTS,
        );

        expect(output).toMatchObject(expectation);
        expect(output.timeInForce).toBeUndefined();
    });
});

describe('preciseOrderValues()', () => {
    it('should precise using basic method with cache data', () => {
        const orderToPrecise = {
            symbol: 'ZEFU/USD',
            type: 'limit',
            side: 'buy',
            price: 400.74040404,
            quantity: 0.000034343433443434444,
        };

        const expectation = {
            symbol: 'ZEFU/USD',
            type: 'limit',
            side: 'buy',
            price: 400,
            quantity: 0.0000343,
        };

        const context = {
            preciseOrderValues: jest.fn().mockReturnValue(expectation),
            cache: {
                globalCache: {
                    get: () => ({
                        get: () => ({
                            pricePrecision: 0,
                            quantityPrecision: 7,
                        }),
                    }),
                },
            },
        };

        expect(
            BinanceSpot.prototype.preciseOrderValues.call(
                context,
                orderToPrecise,
            ),
        ).toStrictEqual(expectation);
    });
});
