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
            })
            .get('/v1/account/accounts')
            .query(() => true) // Should have auth headers, but function run on each request with jest expect.
            .reply(200, {
                status: 'ok',
                data: [
                    {
                        id: 10000001, // Account ID
                        type: 'spot',
                        subtype: '',
                        state: 'working',
                    },
                    {
                        id: 10000002,
                        type: 'otc',
                        subtype: '',
                        state: 'working',
                    },
                ],
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
                .replyWithFile(200, tickersFilePath, {
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
                    })
                    .post('/v1/order/orders/place', (body) => {
                        expect(body['account-id']).toBe(10000001);
                        expect(body.amount).toBeDefined();
                        // expect(body.price).toBeDefined();
                        expect(body.source).toBe('spot-api');
                        expect(body.symbol);
                        expect(body.type).toBe('buy-market');
                        return true;
                    })
                    .query(expectAuthParams)
                    .reply(200, {
                        status: 'ok',
                        data: '356501383558845',
                    }),
            'sell by market': () =>
                nock(HOSTNAME)
                    .post('/v1/order/orders/place', (body) => {
                        expect(body['account-id']).toBe(10000001);
                        expect(body.amount).toBeDefined();
                        // expect(body.price).toBeDefined();
                        expect(body.source).toBe('spot-api');
                        expect(body.symbol);
                        expect(body.type).toBe('sell-market');
                        return true;
                    })
                    .query(expectAuthParams)
                    .reply(200, {
                        status: 'ok',
                        data: '356501383558845',
                    }),
            'buy by limit': () =>
                nock(HOSTNAME)
                    .post('/v1/order/orders/place', (body) => {
                        expect(body['account-id']).toBe(10000001);
                        expect(body.amount);
                        expect(body.price);
                        expect(body.source).toBe('spot-api');
                        expect(body.symbol);
                        expect(body.type).toBe('buy-limit');
                        return true;
                    })
                    .query(expectAuthParams)
                    .reply(200, {
                        status: 'ok',
                        data: '356501383558845',
                    }),
            'sell by limit': () =>
                nock(HOSTNAME)
                    .post('/v1/order/orders/place', (body) => {
                        expect(body['account-id']).toBe(10000001);
                        expect(body.amount);
                        expect(body.price);
                        expect(body.source).toBe('spot-api');
                        expect(body.symbol);
                        expect(body.type).toBe('sell-limit');
                        return true;
                    })
                    .query(expectAuthParams)
                    .reply(200, {
                        status: 'ok',
                        data: '356501383558845',
                    }),
        },
        'fetchBalances()': () =>
            nock(HOSTNAME)
                .get('/v1/account/accounts/10000001/balance')
                .query(expectAuthParams)
                .reply(200, {
                    status: 'ok',
                    data: {
                        id: 1000001,
                        type: 'spot',
                        state: 'working',
                        list: [
                            {
                                currency: 'usdt',
                                type: 'trade',
                                balance: '91.850043797676510303',
                                'seq-num': '477',
                            },
                            {
                                currency: 'usdt',
                                type: 'frozen',
                                balance: '5.160000000000000015',
                                'seq-num': '477',
                            },
                            {
                                currency: 'poly',
                                type: 'trade',
                                balance: '147.928994082840236',
                                'seq-num': '2',
                            },
                        ],
                    },
                }),

        'cancelOrderById()': () =>
            nock(HOSTNAME)
                // Order creation
                .post('/v1/order/orders/place', (body) => {
                    expect(body['account-id']).toBe(10000001);
                    expect(body.amount);
                    expect(body.price);
                    expect(body.source).toBe('spot-api');
                    expect(body.symbol);
                    expect(body.type).toBe('buy-limit');
                    return true;
                })
                .query(expectAuthParams)
                .reply(200, {
                    status: 'ok',
                    data: '356501383558845',
                })
                // Order deletion
                .post(`/v1/order/orders/356501383558845/submitcancel`)
                .query(expectAuthParams)
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

const expectAuthParams = (query) => {
    expect(query.AccessKeyId).toBeDefined();
    expect(query.SignatureMethod).toBe('HmacSHA256');
    expect(query.SignatureVersion).toBe('2');
    expect(query.Timestamp).toBeDefined();
    expect(query.Signature).toBeDefined();
    return true;
};
