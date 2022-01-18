const nock = require('nock');

const HOSTNAME = 'https://api.binance.com/';

const exchangeInfoFilePath = __dirname + '/mocks/static/exchangeInfo.json';
const pricesFilePath = __dirname + '/mocks/static/prices.json';

/**
 * HTTP mocking scope for Binance master test
 * Should be as
 */
module.exports = (env) => ({
    /**
     * Initial nock scope
     */
    init: () =>
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
        'createOrder()': {
            'buy by market': () =>
                nock(HOSTNAME)
                    .matchHeader('X-MBX-APIKEY', env.API_PUBLIC_KEY)
                    .post('/api/v3/order')
                    .query((q) => {
                        expect(q).toMatchObject({
                            symbol: 'BTCUSDT',
                            type: 'MARKET',
                            side: 'BUY',
                            quantity: '0.0004',
                        });

                        expect(q.timestamp).toBeDefined();
                        expect(q.signature).toBeDefined();
                        return true;
                    })
                    .reply(201, {
                        symbol: 'BNBUSDT',
                        orderId: 5114608,
                        orderListId: -1,
                        clientOrderId: 'nVuwTgVfxQtsMV9uuMMXxL',
                        transactTime: 1637596926709,
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
                            symbol: 'BTCUSDT',
                            type: 'MARKET',
                            side: 'SELL',
                            quantity: '0.0004',
                        });
                        expect(q.timestamp).toBeDefined();
                        expect(q.signature).toBeDefined();
                        return true;
                    })
                    .reply(201, {
                        symbol: 'BNBUSDT',
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
                            symbol: 'BTCUSDT',
                            type: 'LIMIT',
                            side: 'BUY',
                            price: '35000',
                            quantity: '0.0004',
                            timeInForce: 'GTC',
                        });
                        expect(q.timestamp).toBeDefined();
                        expect(q.signature).toBeDefined();
                        return true;
                    })
                    .reply(201, {
                        symbol: 'BNBUSDT',
                        orderId: 5123847,
                        orderListId: -1,
                        clientOrderId: '23xVptiQjqI2AgqpZgWI5o',
                        transactTime: 1637599759459,
                        price: '500.00000000',
                        origQty: '1.00000000',
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
                            symbol: 'BTCUSDT',
                            type: 'LIMIT',
                            side: 'SELL',
                            price: '55000',
                            quantity: '0.0004',
                            timeInForce: 'GTC',
                        });
                        expect(q.timestamp).toBeDefined();
                        expect(q.signature).toBeDefined();
                        return true;
                    })
                    .reply(201, {
                        symbol: 'BNBUSDT',
                        orderId: 5123847,
                        orderListId: -1,
                        clientOrderId: '23xVptiQjqI2AgqpZgWI5o',
                        transactTime: 1637599759459,
                        price: '500.00000000',
                        origQty: '1.00000000',
                        executedQty: '0.00000000',
                        cummulativeQuoteQty: '0.00000000',
                        status: 'NEW',
                        timeInForce: 'IOC',
                        type: 'LIMIT',
                        side: 'BUY',
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
                        symbol: 'USDCUSDT',
                        type: 'LIMIT',
                        side: 'BUY',
                        price: '0.8',
                        quantity: '20',
                        timeInForce: 'GTC',
                    });
                    expect(q.timestamp).toBeDefined();
                    expect(q.signature).toBeDefined();
                    return true;
                })
                .reply(200, {
                    symbol: 'BUSDUSDT',
                    orderId: 5123847,
                    orderListId: -1,
                    clientOrderId: '23xVptiQjqI2AgqpZgWI5o',
                    transactTime: 1637599759459,
                    price: '500.00000000',
                    origQty: '1.00000000',
                    executedQty: '0.00000000',
                    cummulativeQuoteQty: '0.00000000',
                    status: 'NEW',
                    timeInForce: 'GTC',
                    type: 'LIMIT',
                    side: 'BUY',
                    fills: [],
                })
                // Order deletion
                .delete('/api/v3/order')
                .query((q) => {
                    expect(q).toMatchObject({
                        symbol: 'BUSDUSDT',
                        orderId: '5123847',
                    });
                    expect(q.signature).toBeDefined();
                    expect(q.timestamp).toBeDefined();
                    return true;
                })
                .reply(200, {
                    symbol: 'BUSDUSDT',
                    orderId: 5123847,
                    orderListId: -1,
                    clientOrderId: '23xVptiQjqI2AgqpZgWI5o',
                    transactTime: 1637599759459,
                    price: '500.00000000',
                    origQty: '1.00000000',
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
                        symbol: 'USDCUSDT',
                        type: 'LIMIT',
                        side: 'BUY',
                        price: '0.8',
                        quantity: '20',
                        timeInForce: 'GTC',
                    });
                    expect(q.timestamp).toBeDefined();
                    expect(q.signature).toBeDefined();
                    return true;
                })
                .reply(200, {
                    symbol: 'BUSDUSDT',
                    orderId: 5123847,
                    orderListId: -1,
                    clientOrderId: '23xVptiQjqI2AgqpZgWI5o',
                    transactTime: 1637599759459,
                    price: '500.00000000',
                    origQty: '1.00000000',
                    executedQty: '0.00000000',
                    cummulativeQuoteQty: '0.00000000',
                    status: 'NEW',
                    timeInForce: 'GTC',
                    type: 'LIMIT',
                    side: 'BUY',
                    fills: [],
                })
                // Order status fetch
                .get('/api/v3/order')
                .query((q) => {
                    expect(q).toMatchObject({
                        symbol: 'BUSDUSDT',
                        orderId: '5123847',
                    });
                    expect(q.signature).toBeDefined();
                    expect(q.timestamp).toBeDefined();
                    return true;
                })
                .reply(200, {
                    symbol: 'BUSDUSDT',
                    orderId: 5123847,
                    orderListId: -1,
                    clientOrderId: '23xVptiQjqI2AgqpZgWI5o',
                    transactTime: 1637599759459,
                    price: '500.00000000',
                    origQty: '1.00000000',
                    executedQty: '0.00000000',
                    cummulativeQuoteQty: '0.00000000',
                    status: 'NEW',
                    timeInForce: 'GTC',
                    type: 'LIMIT',
                    side: 'BUY',
                    fills: [],
                })
                // Order deletion
                .delete('/api/v3/order')
                .query((q) => {
                    expect(q).toMatchObject({
                        symbol: 'BUSDUSDT',
                        orderId: '5123847',
                    });
                    expect(q.signature).toBeDefined();
                    expect(q.timestamp).toBeDefined();
                    return true;
                })
                .reply(200, {
                    symbol: 'BUSDUSDT',
                    orderId: 5123847,
                    orderListId: -1,
                    clientOrderId: '23xVptiQjqI2AgqpZgWI5o',
                    transactTime: 1637599759459,
                    price: '500.00000000',
                    origQty: '1.00000000',
                    executedQty: '0.00000000',
                    cummulativeQuoteQty: '0.00000000',
                    status: 'NEW',
                    timeInForce: 'GTC',
                    type: 'LIMIT',
                    side: 'BUY',
                    fills: [],
                }),
    },
});
