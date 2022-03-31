const utils = require('.');

describe('transfromZenfuseOrder()', () => {
    const { transfromZenfuseOrder } = utils;

    it('should lower case symbols and transform quantity', () => {
        const order = {
            symbol: 'BTC/ETH',
            side: 'seLL',
            type: 'market',
            quantity: 0.000001,
        };

        const expectation = {
            amount: '0.000001',
            source: 'spot-api',
            symbol: 'btceth',
            type: 'sell-market',
        };

        expect(transfromZenfuseOrder(order)).toEqual(expectation);
    });

    it('should add default timeInForce for limit order', () => {
        const order = {
            symbol: 'BTC/USDT',
            side: 'buy',
            type: 'limit',
            quantity: 0.001,
            price: 1235253,
        };

        const expectation = {
            amount: '0.001',
            price: '1235253',
            source: 'spot-api',
            symbol: 'btcusdt',
            type: 'buy-limit',
        };

        expect(transfromZenfuseOrder(order)).toEqual(expectation);
    });

    it('should pass custom timeInForce for limit order', () => {
        const order = {
            symbol: 'ZEFU/USDT',
            side: 'buy',
            type: 'limit',
            quantity: '0.001',
            extra: 'whenhuobi',
        };

        const expectation = {
            amount: '0.001',
            source: 'spot-api',
            symbol: 'zefuusdt',
            type: 'buy-limit',
            extra: 'whenhuobi',
        };

        expect(transfromZenfuseOrder(order)).toEqual(expectation);
    });
});

describe('transformBinanceOrder()', () => {
    const { transfromBinanceOrder } = utils;

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

        expect(result).toMatchSchema(OrderSchema);
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
