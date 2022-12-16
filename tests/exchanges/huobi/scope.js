const nock = require('nock');

const HOSTNAME = 'https://api.huobi.pro';

const OPTIONS = {
    conditionally: () => true,
};

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
        nock(HOSTNAME, OPTIONS)
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
            nock(HOSTNAME, OPTIONS).get('/v1/common/timestamp').reply(200, {
                status: 'ok',
                data: 1629715504949,
            }),
        'fetchMarkets()': () =>
            nock(HOSTNAME, OPTIONS)
                .get('/v2/settings/common/symbols')
                .replyWithFile(200, marketsFilePath, {
                    'Content-Type': 'application/json',
                }),
        'fetchTickers()': () =>
            nock(HOSTNAME, OPTIONS)
                .get('/v2/settings/common/currencies')
                .replyWithFile(200, tickersFilePath, {
                    'Content-Type': 'application/json',
                }),
        'fetchPrice()': () =>
            nock(HOSTNAME, OPTIONS)
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
            nock(HOSTNAME, OPTIONS)
                .get('/market/history/kline')
                .query({
                    symbol: 'btcusdt',
                    period: '1min',
                    size: 2000,
                })
                .replyWithFile(200, candlesFilePath, {
                    'Content-Type': 'application/json',
                }),
        'postOrder()': {
            'buy by market': () =>
                nock(HOSTNAME, OPTIONS)
                    .get('/market/detail')
                    .query({
                        symbol: toHuobiStyle(env.BUY_MARKET_ORDER.symbol),
                    })
                    .reply(200, {
                        ch:
                            'market' +
                            toHuobiStyle(env.BUY_MARKET_ORDER.symbol) +
                            '.detail',
                        status: 'ok',
                        ts: Date.now(),
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
                        expect(body.amount).not.toBe(
                            env.BUY_MARKET_ORDER.quantity.toString(),
                        );
                        expect(body.source).toBe('spot-api');
                        expect(body.symbol).toBe(
                            toHuobiStyle(env.BUY_MARKET_ORDER.symbol),
                        );
                        expect(body.type).toBe('buy-market');
                        return true;
                    })
                    .query(expectAuthParams)
                    .reply(200, {
                        status: 'ok',
                        data: '356501383558845',
                    }),
            'sell by market': () =>
                nock(HOSTNAME, OPTIONS)
                    .post('/v1/order/orders/place', (body) => {
                        expect(body['account-id']).toBe(10000001);
                        expect(body.amount).toBe(
                            env.SELL_MARKET_ORDER.quantity.toString(),
                        );
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
                nock(HOSTNAME, OPTIONS)
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
                nock(HOSTNAME, OPTIONS)
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
            nock(HOSTNAME, OPTIONS)
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

        'cancelOrder()': () =>
            nock(HOSTNAME, OPTIONS)
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

        'cancelOrderById()': () =>
            nock(HOSTNAME, OPTIONS)
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
            nock(HOSTNAME, OPTIONS)
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
                    data: '357632718898331',
                })
                // Order status fetch
                .get('/v1/order/orders/357632718898331')
                .query(expectAuthParams)
                .reply(200, {
                    status: 'ok',
                    data: {
                        id: 357632718898331,
                        symbol: toHuobiStyle(env.NOT_EXECUTABLE_ORDER.symbol),
                        'account-id': 13496526,
                        'client-order-id': '23456',
                        amount: toHuobiStyle(env.NOT_EXECUTABLE_ORDER.quantity),
                        price: toHuobiStyle(env.NOT_EXECUTABLE_ORDER.price),
                        'created-at': Date.now(),
                        type: 'buy-limit',
                        'field-amount': '0.0',
                        'field-cash-amount': '0.0',
                        'field-fees': '0.0',
                        'finished-at': 0,
                        source: 'spot-api',
                        state: 'submitted',
                        'canceled-at': 0,
                    },
                })
                // Order deletion
                .post(`/v1/order/orders/357632718898331/submitcancel`)
                .query(expectAuthParams)
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

/**
 * @param {number|string} value
 * @returns {string}
 */
const toHuobiStyle = (value) => value.toString().replace('/', '').toLowerCase();
