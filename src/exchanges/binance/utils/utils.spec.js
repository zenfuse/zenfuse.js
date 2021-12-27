const utils = require('.');

describe('createHmacSignature()', () => {
    const { createHmacSignature } = utils;

    it('should return valid signature', () => {
        const data = { foo: 'bar' };

        expect(createHmacSignature(data, 'testkey')).toBe(
            'e037a467e455d7847d50df4a6fa3b1c2ebfa4234b19cb7b2a220f1ffbfe9fdb8',
        );
    });
});

describe('transformMarketString()', () => {
    const { transformMarketString } = utils;

    it('should delete slash', () => {
        const result = transformMarketString('ETH/BUSD');
        expect(result).toBe('ETHBUSD');
    });
    it('should upper case things', () => {
        const result = transformMarketString('ethbusd');
        expect(result).toBe('ETHBUSD');
    });
});

describe('transfromZenfuseOrder()', () => {
    const { transfromZenfuseOrder } = utils;

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

        expect(transfromZenfuseOrder(order)).toEqual(expectation);
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

        expect(transfromZenfuseOrder(order)).toEqual(expectation);
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

        expect(transfromZenfuseOrder(order)).toEqual(expectation);
    });
});

describe('transformBinanceOrder()', () => {
    const { transfromBinanceOrder } = utils;

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
            timeInForce: {
                type: 'string',
            },
            price: {
                type: ['number', 'string'],
            },
            quantity: {
                type: ['number', 'string'],
            },
            // trades: {
            //     type: 'object',
            // },
            // remaining: {
            //     type: 'number',
            // },
        },
        additionalProperties: false,
        minProperties: 9,
    };

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
            cummulativeQuoteQty: '1.00000000',
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

        const result = transfromBinanceOrder(binanceCreatedOrder);

        expect(result).toMatchSchema(orderSchema);
    });
});

describe('assignDefaultsInOrder()', () => {
    const { assignDefaultsInOrder } = utils;

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

        const output = assignDefaultsInOrder(order, DEFAULTS);

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

        const output = assignDefaultsInOrder(order, DEFAULTS);

        expect(output).toMatchObject(expectation);
        expect(output.timeInForce).toBeUndefined();
    });
});
