const nock = require('nock');

const HOSTNAME = 'https://api.binance.com/';

const exchangeInfoFilePath = __dirname + '/mocks/static/exchangeInfo.json';
const pricesFilePath = __dirname + '/mocks/static/prices.json';
const historyFilePath = __dirname + '/mocks/static/history.json';

/**
 * HTTP mocking scope for Binance master test
 * Should be as
 *
 * @param {import('../../master.test').MasterTestEnvironment} env
 * @returns {object} Object with test names witch opens nock scope
 */
module.exports = (env) => ({
    // Initial scope
    root: () =>
        nock(HOSTNAME)
            .get('/api/v3/exchangeInfo')
            .replyWithFile(200, exchangeInfoFilePath, {
                'Content-Type': 'application/json',
            }),
    'Spot Wallet HTTP interface': {
        'ping()': () => nock(HOSTNAME).get('/api/v3/ping').reply(200, {}),
        'fetchMarkets()': () =>
            nock(HOSTNAME)
                .get('/api/v3/exchangeInfo')
                .replyWithFile(200, exchangeInfoFilePath, {
                    'Content-Type': 'application/json',
                }),
        'fetchTickers()': () =>
            nock(HOSTNAME)
                .get('/api/v3/exchangeInfo')
                .replyWithFile(200, exchangeInfoFilePath, {
                    'Content-Type': 'application/json',
                }),
        'fetchPrice()': () =>
            nock(HOSTNAME)
                .get('/api/v3/ticker/price')
                .replyWithFile(200, pricesFilePath, {
                    'Content-Type': 'application/json',
                })
                .get('/api/v3/ticker/price')
                .query({ symbol: 'BTCUSDT' })
                .reply(200, {
                    symbol: 'BTCUSDT',
                    price: '9999999.999999',
                }),
        'fetchCandleHistory()': () =>
            nock(HOSTNAME)
                .get('/api/v3/klines')
                .query({
                    symbol: 'BTCUSDT',
                    interval: '1m',
                    limit: 1000,
                })
                .replyWithFile(200, historyFilePath, {
                    'Content-Type': 'application/json',
                }),
        'createOrder()': {
            'buy by market': () =>
                nock(HOSTNAME)
                    .matchHeader('X-MBX-APIKEY', env.API_PUBLIC_KEY)
                    .post('/api/v3/order')
                    .query((q) => {
                        expect(q).toMatchObject({
                            type: 'MARKET',
                            side: 'BUY',
                        });
                        expect(q.symbol).toBe(
                            toBinanceStyle(env.BUY_MARKET_ORDER.symbol),
                        );
                        expect(q.quantity).toBe(
                            toBinanceStyle(env.BUY_MARKET_ORDER.quantity),
                        );

                        expect(q.timestamp).toBeDefined();
                        expect(q.signature).toBeDefined();
                        return true;
                    })
                    .reply(201, {
                        symbol: toBinanceStyle(env.BUY_MARKET_ORDER.symbol),
                        orderId: 5114608,
                        orderListId: -1,
                        clientOrderId: 'nVuwTgVfxQtsMV9uuMMXxL',
                        transactTime: Date.now(),
                        price: '0.00000000',
                        origQty: '1.00000000',
                        executedQty: '1.00000000',
                        cummulativeQuoteQty: '576.46100000',
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
                    }),
            'sell by market': () =>
                nock(HOSTNAME)
                    .matchHeader('X-MBX-APIKEY', env.API_PUBLIC_KEY)
                    .post('/api/v3/order')
                    .query((q) => {
                        expect(q).toMatchObject({
                            type: 'MARKET',
                            side: 'SELL',
                        });
                        expect(q.symbol).toBe(
                            toBinanceStyle(env.SELL_MARKET_ORDER.symbol),
                        );
                        expect(q.quantity).toBe(
                            toBinanceStyle(env.SELL_MARKET_ORDER.quantity),
                        );
                        return true;
                    })
                    .reply(201, {
                        symbol: toBinanceStyle(env.SELL_MARKET_ORDER.symbol),
                        orderId: 5115833,
                        orderListId: -1,
                        clientOrderId: 'AWSXsBUMbl6XT0BpXeT0DN',
                        transactTime: 1637597292702,
                        price: '0.00000000',
                        origQty: '1.00000000',
                        executedQty: '1.00000000',
                        cummulativeQuoteQty: '573.44000000',
                        status: 'FILLED',
                        timeInForce: 'GTC',
                        type: 'MARKET',
                        side: 'SELL',
                        fills: [
                            {
                                price: '573.70000000',
                                qty: '1.0000000',
                                commission: '0.00000000',
                                commissionAsset: 'USDT',
                                tradeId: 239370,
                            },
                        ],
                    }),
            'buy by limit': () =>
                nock(HOSTNAME)
                    .matchHeader('X-MBX-APIKEY', env.API_PUBLIC_KEY)
                    .post('/api/v3/order')
                    .query((q) => {
                        expect(q).toMatchObject({
                            type: 'LIMIT',
                            side: 'BUY',
                        });
                        expect(q.symbol).toBe(
                            toBinanceStyle(env.BUY_LIMIT_ORDER.symbol),
                        );
                        expect(q.quantity).toBe(
                            toBinanceStyle(env.BUY_LIMIT_ORDER.quantity),
                        );
                        return true;
                    })
                    .reply(201, {
                        symbol: toBinanceStyle(env.BUY_LIMIT_ORDER.symbol),
                        orderId: 5123847,
                        orderListId: -1,
                        clientOrderId: '23xVptiQjqI2AgqpZgWI5o',
                        transactTime: 1637599759459,
                        price: toBinanceStyle(env.BUY_LIMIT_ORDER.price),
                        origQty: toBinanceStyle(env.BUY_LIMIT_ORDER.quantity),
                        executedQty: '0.00000000',
                        cummulativeQuoteQty: '0.00000000',
                        status: 'NEW',
                        timeInForce: 'GTC',
                        type: 'LIMIT',
                        side: 'BUY',
                        fills: [],
                    }),
            'sell by limit': () =>
                nock(HOSTNAME)
                    .matchHeader('X-MBX-APIKEY', env.API_PUBLIC_KEY)
                    .post('/api/v3/order')
                    .query((q) => {
                        expect(q).toMatchObject({
                            type: 'LIMIT',
                            side: 'SELL',
                        });
                        expect(q.symbol).toBe(
                            toBinanceStyle(env.SELL_LIMIT_ORDER.symbol),
                        );
                        expect(q.quantity).toBe(
                            toBinanceStyle(env.SELL_LIMIT_ORDER.quantity),
                        );
                        return true;
                    })
                    .reply(201, {
                        symbol: toBinanceStyle(env.SELL_LIMIT_ORDER.symbol),
                        orderId: 5123847,
                        orderListId: -1,
                        clientOrderId: '23xVptiQjqI2AgqpZgWI5o',
                        transactTime: 1637599759459,
                        price: toBinanceStyle(env.SELL_LIMIT_ORDER.price),
                        origQty: toBinanceStyle(env.SELL_LIMIT_ORDER.quantity),
                        executedQty: '0.00000000',
                        cummulativeQuoteQty: '0.00000000',
                        status: 'NEW',
                        timeInForce: 'IOC',
                        type: 'LIMIT',
                        side: 'SELL',
                        fills: [],
                    }),
        },
        'fetchBalances()': () =>
            nock(HOSTNAME)
                .matchHeader('X-MBX-APIKEY', env.API_PUBLIC_KEY)
                .get('/api/v3/account')
                .query((q) => {
                    expect(q.timestamp).toBeDefined();
                    expect(q.signature).toBeDefined();
                    return true;
                })
                .reply(200, {
                    makerCommission: 0,
                    takerCommission: 0,
                    buyerCommission: 0,
                    sellerCommission: 0,
                    canTrade: true,
                    canWithdraw: false,
                    canDeposit: false,
                    updateTime: 1637431263247,
                    accountType: 'SPOT',
                    balances: [
                        {
                            asset: 'BNB',
                            free: '1002.00000000',
                            locked: '0.00000000',
                        },
                        {
                            asset: 'BTC',
                            free: '0.00000000',
                            locked: '0.00000000',
                        },
                        {
                            asset: 'BUSD',
                            free: '9883.26000000',
                            locked: '0.00000000',
                        },
                        {
                            asset: 'ETH',
                            free: '100.00000000',
                            locked: '0.00000000',
                        },
                        {
                            asset: 'LTC',
                            free: '500.00000000',
                            locked: '0.00000000',
                        },
                        {
                            asset: 'TRX',
                            free: '500000.00000000',
                            locked: '0.00000000',
                        },
                        {
                            asset: 'USDT',
                            free: '57080.70341854',
                            locked: '0.00000000',
                        },
                        {
                            asset: 'XRP',
                            free: '50000.00000000',
                            locked: '0.00000000',
                        },
                    ],
                    permissions: ['SPOT'],
                }),
        'cancelOrderById()': () =>
            nock(HOSTNAME)
                .matchHeader('X-MBX-APIKEY', env.API_PUBLIC_KEY)
                // Order creation
                .post('/api/v3/order')
                .query((q) => {
                    expect(q).toMatchObject({
                        symbol: toBinanceStyle(env.NOT_EXECUTABLE_ORDER.symbol),
                        type: toBinanceStyle(env.NOT_EXECUTABLE_ORDER.type),
                        side: toBinanceStyle(env.NOT_EXECUTABLE_ORDER.side),
                        price: toBinanceStyle(env.NOT_EXECUTABLE_ORDER.price),
                        quantity: toBinanceStyle(
                            env.NOT_EXECUTABLE_ORDER.quantity,
                        ),
                    });
                    expect(q.timeInForce).toBeDefined();
                    expect(q.timestamp).toBeDefined();
                    expect(q.signature).toBeDefined();
                    return true;
                })
                .reply(200, {
                    symbol: toBinanceStyle(env.NOT_EXECUTABLE_ORDER.symbol),
                    orderId: 5123847,
                    orderListId: -1,
                    clientOrderId: '23xVptiQjqI2AgqpZgWI5o',
                    transactTime: 1637599759459,
                    price: toBinanceStyle(env.NOT_EXECUTABLE_ORDER.price),
                    origQty: toBinanceStyle(env.NOT_EXECUTABLE_ORDER.quantity),
                    executedQty: '0.00000000',
                    cummulativeQuoteQty: '0.00000000',
                    status: 'NEW',
                    timeInForce: 'GTC',
                    type: toBinanceStyle(env.NOT_EXECUTABLE_ORDER.type),
                    side: toBinanceStyle(env.NOT_EXECUTABLE_ORDER.side),
                    fills: [],
                })
                // Order deletion
                .delete('/api/v3/order')
                .query((q) => {
                    expect(q).toMatchObject({
                        symbol: toBinanceStyle(env.NOT_EXECUTABLE_ORDER.symbol),
                        orderId: '5123847',
                    });
                    expect(q.signature).toBeDefined();
                    expect(q.timestamp).toBeDefined();
                    return true;
                })
                .reply(200, {
                    symbol: toBinanceStyle(env.NOT_EXECUTABLE_ORDER.symbol),
                    orderId: 5123847,
                    orderListId: -1,
                    clientOrderId: '23xVptiQjqI2AgqpZgWI5o',
                    transactTime: 1637599759459,
                    price: toBinanceStyle(env.NOT_EXECUTABLE_ORDER.price),
                    origQty: toBinanceStyle(env.NOT_EXECUTABLE_ORDER.quantity),
                    executedQty: '0.00000000',
                    cummulativeQuoteQty: '0.00000000',
                    status: 'NEW',
                    timeInForce: 'GTC',
                    type: 'LIMIT',
                    side: 'BUY',
                    fills: [],
                }),
        'fetchOrderById()': () =>
            nock(HOSTNAME)
                .matchHeader('X-MBX-APIKEY', env.API_PUBLIC_KEY)
                // Order creation
                .post('/api/v3/order')
                .query((q) => {
                    expect(q).toMatchObject({
                        symbol: toBinanceStyle(env.NOT_EXECUTABLE_ORDER.symbol),
                        type: toBinanceStyle(env.NOT_EXECUTABLE_ORDER.type),
                        side: toBinanceStyle(env.NOT_EXECUTABLE_ORDER.side),
                        price: toBinanceStyle(env.NOT_EXECUTABLE_ORDER.price),
                        quantity: toBinanceStyle(
                            env.NOT_EXECUTABLE_ORDER.quantity,
                        ),
                    });
                    expect(q.timeInForce).toBeDefined();
                    expect(q.timestamp).toBeDefined();
                    expect(q.signature).toBeDefined();
                    return true;
                })
                .reply(200, {
                    symbol: toBinanceStyle(env.NOT_EXECUTABLE_ORDER.symbol),
                    orderId: 5123847,
                    orderListId: -1,
                    clientOrderId: '23xVptiQjqI2AgqpZgWI5o',
                    transactTime: 1637599759459,
                    price: toBinanceStyle(env.NOT_EXECUTABLE_ORDER.price),
                    origQty: toBinanceStyle(env.NOT_EXECUTABLE_ORDER.quantity),
                    executedQty: '0.00000000',
                    cummulativeQuoteQty: '0.00000000',
                    status: 'NEW',
                    timeInForce: 'GTC',
                    type: toBinanceStyle(env.NOT_EXECUTABLE_ORDER.type),
                    side: toBinanceStyle(env.NOT_EXECUTABLE_ORDER.side),
                    fills: [],
                })
                // Order status fetch
                .get('/api/v3/order')
                .query((q) => {
                    expect(q).toMatchObject({
                        symbol: toBinanceStyle(env.NOT_EXECUTABLE_ORDER.symbol),
                        orderId: '5123847',
                    });
                    expect(q.signature).toBeDefined();
                    expect(q.timestamp).toBeDefined();
                    return true;
                })
                .reply(200, {
                    symbol: toBinanceStyle(env.NOT_EXECUTABLE_ORDER.symbol),
                    orderId: 5123847,
                    orderListId: -1,
                    clientOrderId: '23xVptiQjqI2AgqpZgWI5o',
                    transactTime: 1637599759459,
                    price: toBinanceStyle(env.NOT_EXECUTABLE_ORDER.price),
                    origQty: toBinanceStyle(env.NOT_EXECUTABLE_ORDER.quantity),
                    executedQty: '0.00000000',
                    cummulativeQuoteQty: '0.00000000',
                    status: 'NEW',
                    timeInForce: 'GTC',
                    type: toBinanceStyle(env.NOT_EXECUTABLE_ORDER.type),
                    side: toBinanceStyle(env.NOT_EXECUTABLE_ORDER.side),
                    fills: [],
                })
                // Order deletion
                .delete('/api/v3/order')
                .query((q) => {
                    expect(q).toMatchObject({
                        symbol: toBinanceStyle(env.NOT_EXECUTABLE_ORDER.symbol),
                        orderId: '5123847',
                    });
                    expect(q.signature).toBeDefined();
                    expect(q.timestamp).toBeDefined();
                    return true;
                })
                .reply(200, {
                    symbol: toBinanceStyle(env.NOT_EXECUTABLE_ORDER.symbol),
                    orderId: 5123847,
                    orderListId: -1,
                    clientOrderId: '23xVptiQjqI2AgqpZgWI5o',
                    transactTime: 1637599759459,
                    price: toBinanceStyle(env.NOT_EXECUTABLE_ORDER.price),
                    origQty: toBinanceStyle(env.NOT_EXECUTABLE_ORDER.quantity),
                    executedQty: '0.00000000',
                    cummulativeQuoteQty: '0.00000000',
                    status: 'NEW',
                    timeInForce: 'GTC',
                    type: toBinanceStyle(env.NOT_EXECUTABLE_ORDER.type),
                    side: toBinanceStyle(env.NOT_EXECUTABLE_ORDER.side),
                    fills: [],
                }),
    },
    'Error Handling': {
        'INVALID_CREDENTIALS code': () =>
            nock(HOSTNAME)
                .matchHeader('X-MBX-APIKEY', 'invalidPublicKey')
                .get('/api/v3/openOrders')
                .query(() => true)
                .reply(401, { code: -2014, msg: 'API-key format invalid.' }),

        'INSUFFICIENT_FUNDS code': () =>
            nock(HOSTNAME)
                .matchHeader('X-MBX-APIKEY', env.API_PUBLIC_KEY)
                .post('/api/v3/order', () => true)
                .query(() => true)
                .reply(400, {
                    code: -2010,
                    msg: 'Account has insufficient balance for requested action.',
                }),
        'UNKNOWN_EXCEPTION code': () =>
            nock(HOSTNAME)
                .get('/api/v3/myTrades')
                .query(() => true)
                .reply(400, {
                    code: -1102,
                    msg: "Mandatory parameter 'symbol' was not sent, was empty/null, or malformed.",
                }),
    },
});

const toBinanceStyle = (value) =>
    value.toString().replace('/', '').toUpperCase();
