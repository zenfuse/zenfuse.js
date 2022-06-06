/* eslint-disable @cspell/spellchecker */
const nock = require('nock');

const HOSTNAME = 'https://global-openapi.bithumb.pro';

const spotFilePath = __dirname + '/mocks/static/spot.json';
const klineFilePath = __dirname + '/mocks/static/kline.json';

/**
 * HTTP mocking scope for FTX master test
 * Should be as
 *
 * @param {import('../../master.test').MasterTestEnvironment} env
 * @returns {object} Object with test names witch opens nock scope
 */
// eslint-disable-next-line no-unused-vars
module.exports = (env) => ({
    init: null,
    'Spot Wallet HTTP interface': {
        'ping()': () =>
            nock(HOSTNAME)
                .get('/openapi/v1/serverTime')
                .reply(200, { data: Date.now(), code: '0', msg: 'success' }),
        'fetchMarkets()': () =>
            nock(HOSTNAME)
                .get('/openapi/v1/spot/ticker')
                .query({ symbol: 'ALL' })
                .replyWithFile(200, spotFilePath, {
                    'Content-Type': 'application/json',
                }),
        'fetchTickers()': () =>
            nock(HOSTNAME)
                .get('/openapi/v1/spot/ticker')
                .query({ symbol: 'ALL' })
                .replyWithFile(200, spotFilePath, {
                    'Content-Type': 'application/json',
                }),
        'fetchPrice()': () =>
            nock(HOSTNAME)
                .get('/openapi/v1/spot/ticker')
                .query({ symbol: 'ALL' })
                .replyWithFile(200, spotFilePath, {
                    'Content-Type': 'application/json',
                })
                .get('/openapi/v1/spot/ticker')
                .query({ symbol: 'BTC-USDT' })
                .reply(200, {
                    data: [
                        {
                            p: '0.0273',
                            ver: '55739042',
                            vol: '30247196.39470500',
                            c: '38249.00',
                            s: 'BTC-USDT',
                            t: '30247196.39470500',
                            v: '793.849850',
                            h: '39096.19',
                            l: '36818.21',
                            lev: '10',
                        },
                    ],
                    code: '0',
                    msg: 'success',
                    timestamp: 1643713512523,
                    startTime: null,
                }),
        'fetchCandleHistory()': () =>
            nock(HOSTNAME)
                .get('/openapi/v1/spot/kline')
                .query((q) => {
                    expect(q.symbol).toBe(
                        toBithumbStyle(env.CANDLES_REQUEST.symbol),
                    );
                    expect(q.type).toBe('m1'); // TODO: Find healthy way to convert intervals
                    expect(q.start).toBeDefined();
                    expect(q.end).toBeDefined();
                    return true;
                })
                .replyWithFile(200, klineFilePath, {
                    'Content-Type': 'application/json',
                }),
        'postOrder()': {
            'buy by market': () =>
                nock(HOSTNAME)
                    .matchHeader('Content-Type', 'application/json')
                    .get('/openapi/v1/spot/ticker')
                    .query({
                        symbol: toBithumbStyle(env.BUY_MARKET_ORDER.symbol),
                    })
                    .reply(200, {
                        data: [
                            {
                                p: '0.0273',
                                ver: '55739042',
                                vol: '30247196.39470500',
                                c: '38249.00',
                                s: 'BTC-USDT',
                                t: '30247196.39470500',
                                v: '793.849850',
                                h: '39096.19',
                                l: '36818.21',
                                lev: '10',
                            },
                        ],
                        code: '0',
                        msg: 'success',
                        timestamp: 1643713512523,
                        startTime: null,
                    })
                    .post('/openapi/v1/spot/placeOrder', (b) => {
                        expect(b).toMatchObject({
                            symbol: toBithumbStyle(env.BUY_MARKET_ORDER.symbol),
                            type: toBithumbStyle(env.BUY_MARKET_ORDER.type),
                            side: toBithumbStyle(env.BUY_MARKET_ORDER.side),
                            price: toBithumbStyle(env.BUY_MARKET_ORDER.price),
                        });

                        expect(b.apiKey).toBe(env.API_PUBLIC_KEY);
                        expect(b.msgNo).toBeDefined();
                        expect(b.timestamp).toBeDefined();
                        expect(b.signature).toBeDefined();
                        expect(b.quantity).toBeDefined();
                        return true;
                    })
                    .reply(201, {
                        data: {
                            orderId: '23132134242',
                            symbol: toBithumbStyle(env.BUY_MARKET_ORDER.symbol),
                        },
                        code: '0',
                        msg: 'success',
                        timestamp: Date.now(),
                        params: [],
                    }),
            'sell by market': () =>
                nock(HOSTNAME)
                    .matchHeader('Content-Type', 'application/json')
                    .post('/openapi/v1/spot/placeOrder', (b) => {
                        expect(b).toMatchObject({
                            symbol: toBithumbStyle(
                                env.SELL_MARKET_ORDER.symbol,
                            ),
                            type: toBithumbStyle(env.SELL_MARKET_ORDER.type),
                            side: toBithumbStyle(env.SELL_MARKET_ORDER.side),
                            price: toBithumbStyle(env.SELL_MARKET_ORDER.price),
                            quantity: toBithumbStyle(
                                env.SELL_MARKET_ORDER.quantity,
                            ),
                        });

                        expect(b.apiKey).toBe(env.API_PUBLIC_KEY);
                        expect(b.msgNo).toBeDefined();
                        expect(b.timestamp).toBeDefined();
                        expect(b.signature).toBeDefined();
                        return true;
                    })
                    .reply(201, {
                        data: {
                            orderId: '23132134242',
                            symbol: toBithumbStyle(
                                env.SELL_MARKET_ORDER.symbol,
                            ),
                        },
                        code: '0',
                        msg: 'success',
                        timestamp: Date.now(),
                        params: [],
                    }),
            'buy by limit': () =>
                nock(HOSTNAME)
                    .matchHeader('Content-Type', 'application/json')
                    .post('/openapi/v1/spot/placeOrder', (b) => {
                        expect(b).toMatchObject({
                            symbol: toBithumbStyle(env.BUY_LIMIT_ORDER.symbol),
                            type: toBithumbStyle(env.BUY_LIMIT_ORDER.type),
                            side: toBithumbStyle(env.BUY_LIMIT_ORDER.side),
                            price: toBithumbStyle(env.BUY_LIMIT_ORDER.price),
                            quantity: toBithumbStyle(
                                env.BUY_LIMIT_ORDER.quantity,
                            ),
                        });

                        expect(b.apiKey).toBe(env.API_PUBLIC_KEY);
                        expect(b.msgNo).toBeDefined();
                        expect(b.timestamp).toBeDefined();
                        expect(b.signature).toBeDefined();
                        return true;
                    })
                    .reply(201, {
                        data: {
                            orderId: '23132134242',
                            symbol: toBithumbStyle(env.BUY_LIMIT_ORDER.symbol),
                        },
                        code: '0',
                        msg: 'success',
                        timestamp: 1551346473238,
                        params: [],
                    }),
            'sell by limit': () =>
                nock(HOSTNAME)
                    .matchHeader('Content-Type', 'application/json')
                    .post('/openapi/v1/spot/placeOrder', (b) => {
                        expect(b).toMatchObject({
                            symbol: toBithumbStyle(env.SELL_LIMIT_ORDER.symbol),
                            type: toBithumbStyle(env.SELL_LIMIT_ORDER.type),
                            side: toBithumbStyle(env.SELL_LIMIT_ORDER.side),
                            price: toBithumbStyle(env.SELL_LIMIT_ORDER.price),
                            quantity: toBithumbStyle(
                                env.SELL_LIMIT_ORDER.quantity,
                            ),
                        });

                        expect(b.apiKey).toBe(env.API_PUBLIC_KEY);
                        expect(b.msgNo).toBeDefined();
                        expect(b.timestamp).toBeDefined();
                        expect(b.signature).toBeDefined();
                        return true;
                    })
                    .reply(201, {
                        data: {
                            orderId: '23132134242',
                            symbol: toBithumbStyle(env.SELL_LIMIT_ORDER.symbol),
                        },
                        code: '0',
                        msg: 'success',
                        timestamp: 1551346473238,
                        params: [],
                    }),
        },
        'fetchOpenOrders()': () =>
            nock(HOSTNAME)
                .matchHeader('Content-Type', 'application/json')
                // Order creation
                .post('/openapi/v1/spot/placeOrder', (b) => {
                    expect(b).toMatchObject({
                        symbol: toBithumbStyle(env.NOT_EXECUTABLE_ORDER.symbol),
                        type: env.NOT_EXECUTABLE_ORDER.type,
                        side: env.NOT_EXECUTABLE_ORDER.side,
                        quantity: toBithumbStyle(
                            env.NOT_EXECUTABLE_ORDER.quantity,
                        ),
                        price: toBithumbStyle(env.NOT_EXECUTABLE_ORDER.price),
                    });

                    expect(b.apiKey).toBe(env.API_PUBLIC_KEY);
                    expect(b.msgNo).toBeDefined();
                    expect(b.timestamp).toBeDefined();
                    expect(b.signature).toBeDefined();
                    return true;
                })
                .reply(201, {
                    data: {
                        orderId: '23132134242',
                        symbol: toBithumbStyle(env.NOT_EXECUTABLE_ORDER.symbol),
                    },
                    code: '0',
                    msg: 'success',
                    timestamp: 1551346473238,
                    params: [],
                })
                // Order status fetch
                .post('/openapi/v1/spot/openOrders', (b) => {
                    expect(b).toMatchObject({
                        symbol: 'ALL',
                    });

                    expect(b.apiKey).toBe(env.API_PUBLIC_KEY);
                    expect(b.msgNo).toBeDefined();
                    expect(b.timestamp).toBeDefined();
                    expect(b.signature).toBeDefined();
                    return true;
                })
                .reply(200, {
                    data: {
                        num: '1',
                        list: [
                            {
                                orderId: '23132134242',
                                symbol: toBithumbStyle(
                                    env.NOT_EXECUTABLE_ORDER.symbol,
                                ),
                                price: toBithumbStyle(
                                    env.NOT_EXECUTABLE_ORDER.price,
                                ),
                                tradedNum: '0.01',
                                quantity: toBithumbStyle(
                                    env.NOT_EXECUTABLE_ORDER.quantity,
                                ),
                                avgPrice: '0',
                                status: 'pending',
                                type: env.NOT_EXECUTABLE_ORDER.type,
                                side: env.NOT_EXECUTABLE_ORDER.side,
                                createTime: Date.now().toString(),
                                tradeTotal: '0.5',
                            },
                        ],
                    },
                    code: '0',
                    msg: 'success',
                    timestamp: Date.now(),
                    params: [],
                })
                // Order deletion
                .post(`/openapi/v1/spot/cancelOrder`, (b) => {
                    expect(b).toMatchObject({
                        orderId: '23132134242',
                        symbol: toBithumbStyle(env.NOT_EXECUTABLE_ORDER.symbol),
                    });

                    expect(b.apiKey).toBe(env.API_PUBLIC_KEY);
                    expect(b.msgNo).toBeDefined();
                    expect(b.timestamp).toBeDefined();
                    expect(b.signature).toBeDefined();
                    return true;
                })
                .reply(200, {
                    code: '0',
                    msg: 'success',
                    timestamp: Date.now(),
                    params: [],
                }),
        'fetchBalances()': () =>
            nock(HOSTNAME)
                .matchHeader('Content-Type', 'application/json')
                .post('/openapi/v1/spot/assetList', (b) => {
                    expect(b).toMatchObject({
                        assetType: 'spot',
                    });

                    expect(b.apiKey).toBeDefined();
                    expect(b.msgNo).toBeDefined();
                    expect(b.timestamp).toBeDefined();
                    expect(b.signature).toBeDefined();
                    return true;
                })
                .reply(200, {
                    data: [
                        {
                            coinType: 'BTC',
                            count: '100',
                            frozen: '10',
                            btcQuantity: '110',
                            type: '1',
                        },
                    ],
                    code: '0',
                    msg: 'success',
                    timestamp: 1551346473238,
                    params: [],
                }),

        'cancelOrder()': () =>
            nock(HOSTNAME)
                .matchHeader('Content-Type', 'application/json')
                // Order creation
                .post('/openapi/v1/spot/placeOrder', (b) => {
                    expect(b).toMatchObject({
                        symbol: toBithumbStyle(env.NOT_EXECUTABLE_ORDER.symbol),
                        type: env.NOT_EXECUTABLE_ORDER.type,
                        side: env.NOT_EXECUTABLE_ORDER.side,
                        quantity: toBithumbStyle(
                            env.NOT_EXECUTABLE_ORDER.quantity,
                        ),
                        price: toBithumbStyle(env.NOT_EXECUTABLE_ORDER.price),
                    });

                    expect(b.apiKey).toBe(env.API_PUBLIC_KEY);
                    expect(b.msgNo).toBeDefined();
                    expect(b.timestamp).toBeDefined();
                    expect(b.signature).toBeDefined();
                    return true;
                })
                .reply(201, {
                    data: {
                        orderId: '23132134242',
                        symbol: toBithumbStyle(env.NOT_EXECUTABLE_ORDER.symbol),
                    },
                    code: '0',
                    msg: 'success',
                    timestamp: Date.now(),
                    params: [],
                })
                // Order deletion
                .post(`/openapi/v1/spot/cancelOrder`, (q) => {
                    expect(q).toMatchObject({
                        orderId: '23132134242',
                        symbol: toBithumbStyle(env.NOT_EXECUTABLE_ORDER.symbol),
                    });

                    expect(q.apiKey).toBe(env.API_PUBLIC_KEY);
                    expect(q.msgNo).toBeDefined();
                    expect(q.timestamp).toBeDefined();
                    expect(q.signature).toBeDefined();
                    return true;
                })
                .reply(200, {
                    code: '0',
                    msg: 'success',
                    timestamp: 1551346473238,
                    params: [],
                }),

        'cancelOrderById()': () =>
            nock(HOSTNAME)
                .matchHeader('Content-Type', 'application/json')
                // Order creation
                .post('/openapi/v1/spot/placeOrder', (b) => {
                    expect(b).toMatchObject({
                        symbol: toBithumbStyle(env.NOT_EXECUTABLE_ORDER.symbol),
                        type: env.NOT_EXECUTABLE_ORDER.type,
                        side: env.NOT_EXECUTABLE_ORDER.side,
                        quantity: toBithumbStyle(
                            env.NOT_EXECUTABLE_ORDER.quantity,
                        ),
                        price: toBithumbStyle(env.NOT_EXECUTABLE_ORDER.price),
                    });

                    expect(b.apiKey).toBe(env.API_PUBLIC_KEY);
                    expect(b.msgNo).toBeDefined();
                    expect(b.timestamp).toBeDefined();
                    expect(b.signature).toBeDefined();
                    return true;
                })
                .reply(201, {
                    data: {
                        orderId: '23132134242',
                        symbol: toBithumbStyle(env.NOT_EXECUTABLE_ORDER.symbol),
                    },
                    code: '0',
                    msg: 'success',
                    timestamp: Date.now(),
                    params: [],
                })
                // Order deletion
                .post(`/openapi/v1/spot/cancelOrder`, (q) => {
                    expect(q).toMatchObject({
                        orderId: '23132134242',
                        symbol: toBithumbStyle(env.NOT_EXECUTABLE_ORDER.symbol),
                    });

                    expect(q.apiKey).toBe(env.API_PUBLIC_KEY);
                    expect(q.msgNo).toBeDefined();
                    expect(q.timestamp).toBeDefined();
                    expect(q.signature).toBeDefined();
                    return true;
                })
                .reply(200, {
                    code: '0',
                    msg: 'success',
                    timestamp: 1551346473238,
                    params: [],
                }),

        'fetchOrderById()': () =>
            nock(HOSTNAME)
                .matchHeader('Content-Type', 'application/json')
                // Order creation
                .post('/openapi/v1/spot/placeOrder', (b) => {
                    expect(b).toMatchObject({
                        symbol: toBithumbStyle(env.NOT_EXECUTABLE_ORDER.symbol),
                        type: env.NOT_EXECUTABLE_ORDER.type,
                        side: env.NOT_EXECUTABLE_ORDER.side,
                        quantity: toBithumbStyle(
                            env.NOT_EXECUTABLE_ORDER.quantity,
                        ),
                        price: toBithumbStyle(env.NOT_EXECUTABLE_ORDER.price),
                    });

                    expect(b.apiKey).toBe(env.API_PUBLIC_KEY);
                    expect(b.msgNo).toBeDefined();
                    expect(b.timestamp).toBeDefined();
                    expect(b.signature).toBeDefined();
                    return true;
                })
                .reply(201, {
                    data: {
                        orderId: '23132134242',
                        symbol: toBithumbStyle(env.NOT_EXECUTABLE_ORDER.symbol),
                    },
                    code: '0',
                    msg: 'success',
                    timestamp: 1551346473238,
                    params: [],
                })
                // Order status fetch
                .post('/openapi/v1/spot/singleOrder', (b) => {
                    expect(b).toMatchObject({
                        orderId: '23132134242',
                        symbol: toBithumbStyle(env.NOT_EXECUTABLE_ORDER.symbol),
                    });

                    expect(b.apiKey).toBe(env.API_PUBLIC_KEY);
                    expect(b.msgNo).toBeDefined();
                    expect(b.timestamp).toBeDefined();
                    expect(b.signature).toBeDefined();
                    return true;
                })
                .reply(200, {
                    data: {
                        orderId: '23132134242',
                        symbol: toBithumbStyle(env.NOT_EXECUTABLE_ORDER.symbol),
                        price: toBithumbStyle(env.NOT_EXECUTABLE_ORDER.price),
                        tradedNum: '0.01',
                        quantity: toBithumbStyle(
                            env.NOT_EXECUTABLE_ORDER.quantity,
                        ),
                        avgPrice: '0',
                        status: 'pending',
                        type: env.NOT_EXECUTABLE_ORDER.type,
                        side: env.NOT_EXECUTABLE_ORDER.side,
                        createTime: Date.now().toString(),
                        tradeTotal: '0.5',
                    },
                    code: '0',
                    msg: 'success',
                    timestamp: Date.now(),
                    params: [],
                })
                // Order deletion
                .post(`/openapi/v1/spot/cancelOrder`, (b) => {
                    expect(b).toMatchObject({
                        orderId: '23132134242',
                        symbol: toBithumbStyle(env.NOT_EXECUTABLE_ORDER.symbol),
                    });

                    expect(b.apiKey).toBe(env.API_PUBLIC_KEY);
                    expect(b.msgNo).toBeDefined();
                    expect(b.timestamp).toBeDefined();
                    expect(b.signature).toBeDefined();
                    return true;
                })
                .reply(200, {
                    code: '0',
                    msg: 'success',
                    timestamp: Date.now(),
                    params: [],
                }),
    },
    'Error Handling': {
        'INVALID_CREDENTIALS code': () =>
            nock(HOSTNAME)
                .post('/openapi/v1/spot/assetList', (b) => {
                    expect(b.apiKey).toBe('invalidPublicKey');
                    expect(b.msgNo).toBeDefined();
                    expect(b.timestamp).toBeDefined();
                    expect(b.signature).toBeDefined();
                    return true;
                })
                .reply(200, {
                    data: null,
                    code: '9000',
                    msg: 'missing parameter',
                    timestamp: 1650732393939,
                    startTime: null,
                }),

        'INSUFFICIENT_FUNDS code': () =>
            nock(HOSTNAME)
                .post('/openapi/v1/spot/placeOrder', (b) => {
                    expect(b.apiKey).toBe(env.API_PUBLIC_KEY);
                    expect(b.msgNo).toBeDefined();
                    expect(b.timestamp).toBeDefined();
                    expect(b.signature).toBeDefined();
                    return true;
                })
                .reply(200, {
                    data: null,
                    code: '20003',
                    msg: 'user asset not enough',
                    timestamp: 1650732394483,
                    startTime: null,
                }),
        'UNKNOWN_EXCEPTION code': () =>
            nock(HOSTNAME)
                .post('/openapi/v1/spot/openOrders', (b) => {
                    expect(b.apiKey).toBe(env.API_PUBLIC_KEY);
                    expect(b.msgNo).toBeDefined();
                    expect(b.timestamp).toBeDefined();
                    expect(b.signature).toBeDefined();
                    return true;
                })
                .reply(200, {
                    data: null,
                    code: '20031',
                    msg: 'No symbol',
                    timestamp: 1650732394744,
                    startTime: null,
                }),
    },
});

const toBithumbStyle = (value) => value.toString().replace('/', '-');
