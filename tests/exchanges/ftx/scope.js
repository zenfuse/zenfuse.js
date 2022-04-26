/* eslint-disable @cspell/spellchecker */
const nock = require('nock');

const HOSTNAME = 'https://ftx.com/';

const marketsFilePath = __dirname + '/mocks/static/markets.json';
const historyFilePath = __dirname + '/mocks/static/history.json';

/**
 * HTTP mocking scope for FTX master test
 *
 * @param {import('../../master.test').MasterTestEnvironment} env
 * @returns {object} Object with test names witch opens nock scope
 */
module.exports = (env) => ({
    root: null,
    'Spot Wallet HTTP interface': {
        'ping()': () =>
            nock(HOSTNAME)
                .get('/api')
                .reply(200, { success: true, result: true }),
        'fetchMarkets()': () =>
            nock(HOSTNAME)
                .get('/api/markets')
                .replyWithFile(200, marketsFilePath, {
                    'Content-Type': 'application/json',
                }),
        'fetchTickers()': () =>
            nock(HOSTNAME)
                .get('/api/markets')
                .replyWithFile(200, marketsFilePath, {
                    'Content-Type': 'application/json',
                }),
        'fetchPrice()': () =>
            nock(HOSTNAME)
                .get('/api/markets')
                .replyWithFile(200, marketsFilePath, {
                    'Content-Type': 'application/json',
                })
                .get('/api/markets/BTC/USDT')
                .reply(200, {
                    success: true,
                    result: {
                        name: 'BTC/USDT',
                        enabled: true,
                        postOnly: false,
                        priceIncrement: 1.0,
                        sizeIncrement: 0.0001,
                        minProvideSize: 0.0001,
                        last: 41577.0,
                        bid: 41573.0,
                        ask: 41575.0,
                        price: 41575.0,
                        type: 'spot',
                        baseCurrency: 'BTC',
                        quoteCurrency: 'USDT',
                        underlying: null,
                        restricted: false,
                        highLeverageFeeExempt: true,
                        change1h: 0.00009622092323975848,
                        change24h: 0.0012764317711092914,
                        changeBod: -0.0002885517108711857,
                        quoteVolume24h: 116192699.7696,
                        volumeUsd24h: 116191540.1664563,
                    },
                }),
        'fetchCandleHistory()': () =>
            nock(HOSTNAME)
                .get('/api/markets/BTC/USDT/candles')
                .query({
                    resolution: 60,
                })
                .replyWithFile(200, historyFilePath, {
                    'Content-Type': 'application/json',
                }),
        'createOrder()': {
            'buy by market': () =>
                nock(HOSTNAME)
                    .matchHeader('FTX-KEY', env.API_PUBLIC_KEY)
                    .matchHeader('FTX-TS', Boolean)
                    .matchHeader('FTX-SIGN', Boolean)
                    .post('/api/orders', {
                        market: env.BUY_MARKET_ORDER.symbol,
                        side: 'buy',
                        type: 'market',
                        price: null,
                        size: env.BUY_MARKET_ORDER.quantity,
                    })
                    .reply(201, {
                        success: true,
                        result: {
                            id: 112582179056,
                            clientId: null,
                            market: env.BUY_MARKET_ORDER.symbol,
                            type: 'market',
                            side: 'buy',
                            price: null,
                            size: env.BUY_MARKET_ORDER.quantity,
                            status: 'new',
                            filledSize: 0,
                            remainingSize: env.BUY_MARKET_ORDER.quantity,
                            reduceOnly: false,
                            liquidation: null,
                            avgFillPrice: null,
                            postOnly: false,
                            ioc: true,
                            createdAt: new Date(),
                            future: null,
                        },
                    }),
            'sell by market': () =>
                nock(HOSTNAME)
                    .matchHeader('FTX-KEY', env.API_PUBLIC_KEY)
                    .matchHeader('FTX-TS', Boolean)
                    .matchHeader('FTX-SIGN', Boolean)
                    .post('/api/orders', {
                        market: env.SELL_MARKET_ORDER.symbol,
                        side: 'sell',
                        type: 'market',
                        price: null,
                        size: env.SELL_MARKET_ORDER.quantity,
                    })
                    .reply(201, {
                        success: true,
                        result: {
                            id: 112587218515,
                            clientId: null,
                            market: env.SELL_MARKET_ORDER.symbol,
                            type: 'market',
                            side: 'sell',
                            price: null,
                            size: env.SELL_MARKET_ORDER.quantity,
                            status: 'new',
                            filledSize: 0,
                            remainingSize: env.SELL_MARKET_ORDER.quantity,
                            reduceOnly: false,
                            liquidation: null,
                            avgFillPrice: null,
                            postOnly: false,
                            ioc: true,
                            createdAt: new Date(),
                            future: null,
                        },
                    }),
            'buy by limit': () =>
                nock(HOSTNAME)
                    .matchHeader('FTX-KEY', env.API_PUBLIC_KEY)
                    .matchHeader('FTX-TS', Boolean)
                    .matchHeader('FTX-SIGN', Boolean)
                    .post('/api/orders', {
                        market: env.BUY_LIMIT_ORDER.symbol,
                        type: 'limit',
                        side: 'buy',
                        size: env.BUY_LIMIT_ORDER.quantity,
                        price: env.BUY_LIMIT_ORDER.price,
                    })
                    .reply(201, {
                        success: true,
                        result: {
                            id: 112588036315,
                            clientId: null,
                            market: env.BUY_LIMIT_ORDER.symbol,
                            type: 'limit',
                            side: 'buy',
                            price: env.BUY_LIMIT_ORDER.price,
                            size: env.BUY_LIMIT_ORDER.quantity,
                            status: 'new',
                            filledSize: 0,
                            remainingSize: env.BUY_LIMIT_ORDER.quantity,
                            reduceOnly: false,
                            liquidation: null,
                            avgFillPrice: null,
                            postOnly: false,
                            ioc: false,
                            createdAt: new Date(),
                            future: null,
                        },
                    }),
            'sell by limit': () =>
                nock(HOSTNAME)
                    .matchHeader('FTX-KEY', env.API_PUBLIC_KEY)
                    .matchHeader('FTX-TS', Boolean)
                    .matchHeader('FTX-SIGN', Boolean)
                    .post('/api/orders', {
                        market: env.SELL_LIMIT_ORDER.symbol,
                        type: 'limit',
                        side: 'sell',
                        size: env.SELL_LIMIT_ORDER.quantity,
                        price: env.SELL_LIMIT_ORDER.price,
                    })
                    .reply(201, {
                        success: true,
                        result: {
                            id: 112589159471,
                            clientId: null,
                            market: env.SELL_LIMIT_ORDER.symbol,
                            type: 'limit',
                            side: 'sell',
                            price: env.SELL_LIMIT_ORDER.price,
                            size: env.SELL_LIMIT_ORDER.quantity,
                            status: 'new',
                            filledSize: 0,
                            remainingSize: env.SELL_LIMIT_ORDER.quantity,
                            reduceOnly: false,
                            liquidation: null,
                            avgFillPrice: null,
                            postOnly: false,
                            ioc: false,
                            createdAt: new Date(),
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

        'cancelOrder()': () =>
            nock(HOSTNAME)
                .matchHeader('FTX-KEY', env.API_PUBLIC_KEY)
                .matchHeader('FTX-TS', Boolean)
                .matchHeader('FTX-SIGN', Boolean)
                // Order creation
                .post('/api/orders', {
                    market: env.NOT_EXECUTABLE_ORDER.symbol,
                    type: env.NOT_EXECUTABLE_ORDER.type,
                    side: env.NOT_EXECUTABLE_ORDER.side,
                    size: env.NOT_EXECUTABLE_ORDER.quantity,
                    price: env.NOT_EXECUTABLE_ORDER.price,
                })
                .reply(200, {
                    success: true,
                    result: {
                        id: 112590877630,
                        clientId: null,
                        market: env.NOT_EXECUTABLE_ORDER.symbol,
                        type: env.NOT_EXECUTABLE_ORDER.type,
                        side: env.NOT_EXECUTABLE_ORDER.side,
                        price: env.NOT_EXECUTABLE_ORDER.price,
                        size: env.NOT_EXECUTABLE_ORDER.quantity,
                        status: 'new',
                        filledSize: 0,
                        remainingSize: env.NOT_EXECUTABLE_ORDER.quantity,
                        reduceOnly: false,
                        liquidation: null,
                        avgFillPrice: null,
                        postOnly: false,
                        ioc: false,
                        createdAt: new Date(),
                        future: null,
                    },
                })
                // Order deletion
                .delete(`/api/orders/112590877630`)
                .reply(200),

        'cancelOrderById()': () =>
            nock(HOSTNAME)
                .matchHeader('FTX-KEY', env.API_PUBLIC_KEY)
                .matchHeader('FTX-TS', Boolean)
                .matchHeader('FTX-SIGN', Boolean)
                // Order creation
                .post('/api/orders', {
                    market: env.NOT_EXECUTABLE_ORDER.symbol,
                    type: env.NOT_EXECUTABLE_ORDER.type,
                    side: env.NOT_EXECUTABLE_ORDER.side,
                    size: env.NOT_EXECUTABLE_ORDER.quantity,
                    price: env.NOT_EXECUTABLE_ORDER.price,
                })
                .reply(200, {
                    success: true,
                    result: {
                        id: 112590877630,
                        clientId: null,
                        market: env.NOT_EXECUTABLE_ORDER.symbol,
                        type: env.NOT_EXECUTABLE_ORDER.type,
                        side: env.NOT_EXECUTABLE_ORDER.side,
                        price: env.NOT_EXECUTABLE_ORDER.price,
                        size: env.NOT_EXECUTABLE_ORDER.quantity,
                        status: 'new',
                        filledSize: 0,
                        remainingSize: env.NOT_EXECUTABLE_ORDER.quantity,
                        reduceOnly: false,
                        liquidation: null,
                        avgFillPrice: null,
                        postOnly: false,
                        ioc: false,
                        createdAt: new Date(),
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
                    market: env.NOT_EXECUTABLE_ORDER.symbol,
                    type: env.NOT_EXECUTABLE_ORDER.type,
                    side: env.NOT_EXECUTABLE_ORDER.side,
                    size: env.NOT_EXECUTABLE_ORDER.quantity,
                    price: env.NOT_EXECUTABLE_ORDER.price,
                })
                .reply(200, {
                    success: true,
                    result: {
                        id: 112590877631,
                        clientId: null,
                        market: env.NOT_EXECUTABLE_ORDER.symbol,
                        type: env.NOT_EXECUTABLE_ORDER.type,
                        side: env.NOT_EXECUTABLE_ORDER.side,
                        price: env.NOT_EXECUTABLE_ORDER.price,
                        size: env.NOT_EXECUTABLE_ORDER.quantity,
                        status: 'new',
                        filledSize: 0,
                        remainingSize: env.NOT_EXECUTABLE_ORDER.quantity,
                        reduceOnly: false,
                        liquidation: null,
                        avgFillPrice: null,
                        postOnly: false,
                        ioc: false,
                        createdAt: '2022-04-10T21:10:29.520Z',
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
                        market: env.NOT_EXECUTABLE_ORDER.symbol,
                        type: env.NOT_EXECUTABLE_ORDER.type,
                        side: env.NOT_EXECUTABLE_ORDER.side,
                        price: env.NOT_EXECUTABLE_ORDER.price,
                        size: env.NOT_EXECUTABLE_ORDER.quantity,
                        status: 'new',
                        filledSize: 0,
                        remainingSize: env.NOT_EXECUTABLE_ORDER.quantity,
                        reduceOnly: false,
                        liquidation: null,
                        avgFillPrice: null,
                        postOnly: false,
                        ioc: false,
                        createdAt: '2022-04-10T21:10:29.520Z',
                        future: null,
                    },
                })
                // Order deletion
                .delete(`/api/orders/112590877631`)
                .reply(200),
    },
    'Error Handling': {
        'INVALID_CREDENTIALS code': () =>
            nock(HOSTNAME)
                .matchHeader('FTX-KEY', 'invalidPublicKey')
                .matchHeader('FTX-TS', Boolean)
                .matchHeader('FTX-SIGN', Boolean)
                .get('/api/orders')
                .query(() => true)
                .reply(401, {
                    success: false,
                    error: 'Not logged in: Invalid API key',
                }),

        'INSUFFICIENT_FUNDS code': () =>
            nock(HOSTNAME)
                .matchHeader('FTX-KEY', env.API_PUBLIC_KEY)
                .matchHeader('FTX-TS', Boolean)
                .matchHeader('FTX-SIGN', Boolean)
                .post('/api/orders', () => true)
                .query(() => true)
                .reply(400, { success: false, error: 'Not enough balances' }),
        'UNKNOWN_EXCEPTION code': () =>
            nock(HOSTNAME)
                .matchHeader('FTX-KEY', env.API_PUBLIC_KEY)
                .matchHeader('FTX-TS', Boolean)
                .matchHeader('FTX-SIGN', Boolean)
                .post('/api/orders/invalid_order_id/modify')
                .query(() => true)
                .reply(404, {
                    error: '404 Not Found: The requested URL was not found on the server. If you entered the URL manually please check your spelling and try again.',
                    success: false,
                }),
    },
});
