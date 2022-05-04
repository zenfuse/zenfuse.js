const nock = require('nock');
const path = require('path');
const { Binance } = require('zenfuse');

const HOSTNAME = 'https://api.binance.com/';
const exchangeInfoFilePath = path.resolve(
    'tests/exchanges/binance/mocks/static/exchangeInfo.json',
);

let exchange = new Binance['spot']();
let stream = exchange.getAccountDataStream();

const scope = () => ({
    root: () =>
        nock(HOSTNAME)
            .get('/api/v3/exchangeInfo')
            .replyWithFile(200, exchangeInfoFilePath, {
                'Content-Type': 'application/json',
            }),
});

global.httpScope = scope();

describe('transfromZenfuseOrder()', () => {
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

        expect(exchange.transformZenfuseOrder(order)).toEqual(expectation);
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

        expect(exchange.transformZenfuseOrder(order)).toEqual(expectation);
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

        expect(exchange.transformZenfuseOrder(order)).toEqual(expectation);
    });
});

describe('transformBinanceOrder()', () => {
    const OrderSchema = require('../../base/schemas/openOrder').omit({
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

        const result = exchange.transformBinanceOrder(binanceCreatedOrder);

        expect(result).toMatchSchema(OrderSchema);
    });
});

describe('transformWebsocketOrder()', () => {
    const OrderSchema = require('../../base/schemas/openOrder');

    it('should transform order', () => {
        const binanceCreatedOrder = {
            e: 'executionReport',
            E: 1499405658658,
            s: 'ETHBTC',
            c: 'mUvoqJxFIILMdfAW5iGSOW',
            S: 'BUY',
            o: 'LIMIT',
            f: 'GTC',
            q: '1.00000000',
            p: '0.10264410',
            P: '0.00000000',
            d: 4,
            F: '0.00000000',
            g: -1,
            C: null,
            x: 'NEW',
            X: 'NEW',
            r: 'NONE',
            i: 4293153,
            l: '0.00000000',
            z: '0.00000000',
            L: '0.00000000',
            n: '0',
            N: null,
            T: 1499405658657,
            t: -1,
            I: 8641984,
            w: true,
            m: false,
            M: false,
            O: 1499405658657,
            Z: '0.00000000',
            Y: '0.00000000',
            Q: '0.00000000',
        };

        const result = stream.transformWebsocketOrder(binanceCreatedOrder);

        expect(result).toMatchSchema(OrderSchema);
    });
});

describe('transformCandlestick()', () => {
    const KlineSchema = require('../../base/schemas/kline').omit({
        symbol: true,
    });

    it('should transform candlestick', () => {
        const kline = {
            e: 'kline',
            E: 123456789,
            s: 'BNBBTC',
            k: {
                t: 123400000,
                T: 123460000,
                s: 'BNBBTC',
                i: '1m',
                f: 100,
                L: 200,
                o: '0.0010',
                c: '0.0020',
                h: '0.0025',
                l: '0.0015',
                v: '1000',
                n: 100,
                x: false,
                q: '1.0000',
                V: '500',
                Q: '0.500',
                B: '123456',
            },
        };

        const expectedResult = {
            open: 0.001,
            high: 0.0025,
            low: 0.0015,
            close: 0.002,
            timestamp: 123400000,
            interval: '1m',
            isClosed: false,
            symbol: 'BNBBTC',
            volume: 1000,
        };

        const result = stream.transformCandlestick(kline.k);

        expect(result).toStrictEqual(expectedResult);
        expect(result).toMatchSchema(KlineSchema);
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

        const output = exchange.assignDefaultsInOrder(order, DEFAULTS);

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

        const output = exchange.assignDefaultsInOrder(order, DEFAULTS);

        expect(output).toMatchObject(expectation);
        expect(output.timeInForce).toBeUndefined();
    });
});
