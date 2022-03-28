const nock = require('nock');

const HOSTNAME = 'https://api.huobi.pro';

const marketsFilePath = __dirname + '/mocks/static/markets.json';
const tickersFilePath = __dirname + '/mocks/static/tickers.json';
const pairsFilePath = __dirname + '/mocks/static/pairs.json';
const candlesFilePath = __dirname + '/mocks/static/candles.json';

/**
 * HTTP mocking scope for FTX master test
 * Should be as
 *
 * @param {import('../../master.test').MasterTestEnvironment} env
 * @returns {object} Object with test names witch opens nock scope
 */
module.exports = (env) => ({
    root: () =>
        nock(HOSTNAME)
            .get('/v2/settings/common/symbols')
            .replyWithFile(200, marketsFilePath, {
                'Content-Type': 'application/json',
            }),
    'Spot Wallet HTTP interface': {
        'ping()': () =>
            nock(HOSTNAME).get('/v1/common/timestamp').reply(200, {
                status: 'ok',
                data: 1629715504949,
            }),
        'fetchMarkets()': () =>
            nock(HOSTNAME)
                .get('/v2/settings/common/symbols')
                .replyWithFile(200, marketsFilePath, {
                    'Content-Type': 'application/json',
                }),
        'fetchTickers()': () =>
            nock(HOSTNAME)
                .get('/v2/settings/common/currencies')
                .replyWithFile(200, marketsFilePath, {
                    'Content-Type': 'application/json',
                }),
        'fetchPrice()': () =>
            nock(HOSTNAME)
                .get('/market/tickers')
                .replyWithFile(200, pairsFilePath, {
                    'Content-Type': 'application/json',
                })
                .get('/market/detail')
                .query({
                    symbol: 'btcusdt',
                })
                .reply(200, {
                    ch: 'market.btcusdt.detail',
                    status: 'ok',
                    ts: 1648488158136,
                    tick: {
                        id: 301148161314,
                        low: 44677.75,
                        high: 47892.12,
                        open: 44798.72,
                        close: 47383.08,
                        vol: 506735292.11928594,
                        amount: 10836.476586616349,
                        version: 301148161314,
                        count: 591092,
                    },
                }),
        'fetchCandleHistory()': () =>
            nock(HOSTNAME)
                .get('/market/history/kline')
                .query({
                    symbol: 'btcusdt',
                    period: '1min',
                    size: 2000,
                })
                .replyWithFile(200, candlesFilePath, {
                    'Content-Type': 'application/json',
                }),
        'createOrder()': {
            'buy by market': () =>
                nock(HOSTNAME)
                    .matchHeader('FTX-KEY', env.API_PUBLIC_KEY)
                    .matchHeader('FTX-TS', Boolean)
                    .matchHeader('FTX-SIGN', Boolean)
                    .post('/api/orders', {
                        market: 'BTC/USDT',
                        side: 'buy',
                        type: 'market',
                        price: null,
                        size: 0.0004,
                    })
                    .reply(201, {
                        success: true,
                        result: {
                            id: 112582179056,
                            clientId: null,
                            market: 'BTC/USDT',
                            type: 'market',
                            side: 'buy',
                            price: null,
                            size: 0.0004,
                            status: 'new',
                            filledSize: 0,
                            remainingSize: 0.0004,
                            reduceOnly: false,
                            liquidation: null,
                            avgFillPrice: null,
                            postOnly: false,
                            ioc: true,
                            createdAt: '2022-01-11T17:41:47.235109+00:00',
                            future: null,
                        },
                    }),
            'sell by market': () =>
                nock(HOSTNAME)
                    .matchHeader('FTX-KEY', env.API_PUBLIC_KEY)
                    .matchHeader('FTX-TS', Boolean)
                    .matchHeader('FTX-SIGN', Boolean)
                    .post('/api/orders', {
                        market: 'BTC/USDT',
                        side: 'sell',
                        type: 'market',
                        price: null,
                        size: 0.0004,
                    })
                    .reply(201, {
                        success: true,
                        result: {
                            id: 112587218515,
                            clientId: null,
                            market: 'BTC/USDT',
                            type: 'market',
                            side: 'sell',
                            price: null,
                            size: 0.0004,
                            status: 'new',
                            filledSize: 0,
                            remainingSize: 0.0004,
                            reduceOnly: false,
                            liquidation: null,
                            avgFillPrice: null,
                            postOnly: false,
                            ioc: true,
                            createdAt: '2022-01-11T18:04:55.627232+00:00',
                            future: null,
                        },
                    }),
            'buy by limit': () =>
                nock(HOSTNAME)
                    .matchHeader('FTX-KEY', env.API_PUBLIC_KEY)
                    .matchHeader('FTX-TS', Boolean)
                    .matchHeader('FTX-SIGN', Boolean)
                    .post('/api/orders', {
                        market: 'BTC/USDT',
                        type: 'limit',
                        side: 'buy',
                        size: 0.0004,
                        price: 35000,
                    })
                    .reply(201, {
                        success: true,
                        result: {
                            id: 112588036315,
                            clientId: null,
                            market: 'BTC/USDT',
                            type: 'limit',
                            side: 'buy',
                            price: 35000,
                            size: 0.0004,
                            status: 'new',
                            filledSize: 0,
                            remainingSize: 0.0004,
                            reduceOnly: false,
                            liquidation: null,
                            avgFillPrice: null,
                            postOnly: false,
                            ioc: false,
                            createdAt: '2022-01-11T18:08:16.731842+00:00',
                            future: null,
                        },
                    }),
            'sell by limit': () =>
                nock(HOSTNAME)
                    .matchHeader('FTX-KEY', env.API_PUBLIC_KEY)
                    .matchHeader('FTX-TS', Boolean)
                    .matchHeader('FTX-SIGN', Boolean)
                    .post('/api/orders', {
                        market: 'BTC/USDT',
                        type: 'limit',
                        side: 'sell',
                        size: 0.0004,
                        price: 55000,
                    })
                    .reply(201, {
                        success: true,
                        result: {
                            id: 112589159471,
                            clientId: null,
                            market: 'BTC/USDT',
                            type: 'limit',
                            side: 'sell',
                            price: 55000,
                            size: 0.0004,
                            status: 'new',
                            filledSize: 0,
                            remainingSize: 0.0004,
                            reduceOnly: false,
                            liquidation: null,
                            avgFillPrice: null,
                            postOnly: false,
                            ioc: false,
                            createdAt: '2022-01-11T18:13:38.138876+00:00',
                            future: null,
                        },
                    }),
        },
        'fetchBalances()': () =>
            nock(HOSTNAME)
                .matchHeader('FTX-KEY', env.API_PUBLIC_KEY)
                .matchHeader('FTX-SIGN', Boolean)
                .matchHeader('FTX-TS', Boolean)
                .get('/api/wallet/balances')
                .reply(200, {
                    success: true,
                    result: [
                        {
                            coin: 'USDTBEAR',
                            free: 2320.2,
                            spotBorrow: 0.0,
                            total: 2340.2,
                            usdValue: 2340.2,
                            availableWithoutBorrow: 2320.2,
                        },
                    ],
                }),

        'cancelOrderById()': () =>
            nock(HOSTNAME)
                .matchHeader('FTX-KEY', env.API_PUBLIC_KEY)
                .matchHeader('FTX-TS', Boolean)
                .matchHeader('FTX-SIGN', Boolean)
                // Order creation
                .post('/api/orders', {
                    market: 'USDT/USD',
                    type: 'limit',
                    side: 'buy',
                    size: 20,
                    price: 0.5,
                })
                .reply(200, {
                    success: true,
                    result: {
                        id: 112590877630,
                        clientId: null,
                        market: 'USDT/USD',
                        type: 'limit',
                        side: 'buy',
                        price: 0.5,
                        size: 20,
                        status: 'new',
                        filledSize: 0,
                        remainingSize: 20,
                        reduceOnly: false,
                        liquidation: null,
                        avgFillPrice: null,
                        postOnly: false,
                        ioc: false,
                        createdAt: '2022-01-11T18:21:19.188847+00:00',
                        future: null,
                    },
                })
                // Order deletion
                .delete(`/api/orders/112590877630`)
                .reply(200),

        'fetchOrderById()': () =>
            nock(HOSTNAME)
                .matchHeader('FTX-KEY', env.API_PUBLIC_KEY)
                .matchHeader('FTX-TS', Boolean)
                .matchHeader('FTX-SIGN', Boolean)
                // Order creation
                .post('/api/orders', {
                    market: 'USDT/USD',
                    type: 'limit',
                    side: 'buy',
                    size: 20,
                    price: 0.5,
                })
                .reply(200, {
                    success: true,
                    result: {
                        id: 112590877631,
                        clientId: null,
                        market: 'USDT/USD',
                        type: 'limit',
                        side: 'buy',
                        price: 0.5,
                        size: 20,
                        status: 'new',
                        filledSize: 0,
                        remainingSize: 20,
                        reduceOnly: false,
                        liquidation: null,
                        avgFillPrice: null,
                        postOnly: false,
                        ioc: false,
                        createdAt: '2022-01-11T18:21:19.188847+00:00',
                        future: null,
                    },
                })
                // Order status fetch
                .get('/api/orders/112590877631')
                .reply(200, {
                    success: true,
                    result: {
                        id: 112590877631,
                        clientId: null,
                        market: 'USDT/USD',
                        type: 'limit',
                        side: 'buy',
                        price: 0.5,
                        size: 20,
                        status: 'new',
                        filledSize: 0,
                        remainingSize: 20,
                        reduceOnly: false,
                        liquidation: null,
                        avgFillPrice: null,
                        postOnly: false,
                        ioc: false,
                        createdAt: '2022-01-11T18:21:19.188847+00:00',
                        future: null,
                    },
                })
                // Order deletion
                .delete(`/api/orders/112590877631`)
                .reply(200),
    },
});
