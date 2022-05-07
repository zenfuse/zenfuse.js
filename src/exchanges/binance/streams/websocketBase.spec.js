/* eslint-disable @cspell/spellchecker */
const BinanceWsBase = require('./websocketBase');

const mockedContext = {
    base: {
        parseBinanceSymbol: jest.fn().mockReturnValue('ETH/BTC'),
    },
};

describe('transformWebsocketOrder()', () => {
    const OrderSchema = require('../../../base/schemas/openOrder');

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

        expect(
            BinanceWsBase.prototype.transformWebsocketOrder.apply(
                mockedContext,
                [binanceCreatedOrder],
            ),
        ).toMatchSchema(OrderSchema);
    });
});

describe('transformCandlestick()', () => {
    const KlineSchema = require('../../../base/schemas/kline').omit({
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

        const result = BinanceWsBase.prototype.transformCandlestick.apply(
            mockedContext,
            [kline.k],
        );

        expect(result).toStrictEqual(expectedResult);
        expect(result).toMatchSchema(KlineSchema);
    });
});
