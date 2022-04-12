const nock = require('nock');

const HOSTNAME = 'https://okx.com';

const spotFilePath = __dirname + '/mocks/static/spot.json';
const historyFilePath = __dirname + '/mocks/static/history.json';

/**
 * HTTP mocking scope for OKX master test
 * Should be as
 *
 * @param {import('../../master.test').MasterTestEnvironment} env
 * @returns {object} Object with test names which opens nock scope
 */
module.exports = (env) => ({
    root: null,
    'Spot Wallet HTTP interface': {
        'ping()': () =>
            nock(HOSTNAME)
                .get('/api/v5/public/time')
                .reply(200, {
                    code: '0',
                    data: [
                        {
                            ts: Date.now(),
                        },
                    ],
                    msg: '',
                }),
        'fetchMarkets()': () =>
            nock(HOSTNAME)
                .get('/api/v5/market/tickers')
                .query({ instType: 'SPOT' })
                .replyWithFile(200, spotFilePath, {
                    'Content-Type': 'application/json',
                }),
        'fetchTickers()': () =>
            nock(HOSTNAME)
                .get('/api/v5/market/tickers')
                .query({ instType: 'SPOT' })
                .replyWithFile(200, spotFilePath, {
                    'Content-Type': 'application/json',
                }),
        'fetchPrice()': () =>
            nock(HOSTNAME)
                .get('/api/v5/market/tickers')
                .query({ instType: 'SPOT' })
                .replyWithFile(200, spotFilePath, {
                    'Content-Type': 'application/json',
                })
                .get('/api/v5/market/ticker')
                .query({ instId: 'BTC-USDT' })
                .reply(200, {
                    code: '0',
                    msg: '',
                    data: [
                        {
                            instType: 'SPOT',
                            instId: 'BTC-USDT',
                            last: '39466.5',
                            lastSz: '0.02413831',
                            askPx: '39466.5',
                            askSz: '0.33213231',
                            bidPx: '39466.4',
                            bidSz: '0.13488312',
                            open24h: '42105',
                            high24h: '42410',
                            low24h: '39190',
                            volCcy24h: '549944177.76344598',
                            vol24h: '13468.43820924',
                            ts: '1649721511728',
                            sodUtc0: '42149.3',
                            sodUtc8: '40580.1',
                        },
                    ],
                }),
        'fetchCandleHistory()': () =>
            nock(HOSTNAME)
                .get('/api/v5/market/history-candles')
                .query({
                    instId: 'BTC-USDT',
                    bar: '1m',
                })
                .replyWithFile(200, historyFilePath, {
                    'Content-Type': 'application/json',
                }),
        'createOrder()': {
            'buy by market': () =>
                nock(HOSTNAME)
                    .matchHeader('OKX-ACCESS-KEY', env.API_PUBLIC_KEY)
                    .matchHeader('OKX-ACCESS-TIMESTAMP', Boolean)
                    .matchHeader('OKX-ACCESS-SIGN', Boolean)
                    .matchHeader('OKX-ACCESS-PASSPHRASE', Boolean)
                    .post('/api/orders', {
                        market: 'BTC/USDT',
                        side: 'buy',
                        type: 'market',
                        price: null,
                        size: 0.0004,
                    })
                    .reply(201, {
                        code: '0',
                        msg: '',
                        data: [
                            {
                                // clOrdId: "oktswap6",
                                ordId: '312269865356374016',
                                tag: '',
                                sCode: '0',
                                sMsg: '',
                            },
                        ],
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
