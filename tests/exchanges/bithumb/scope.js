const nock = require('nock');
const { isExportDeclaration } = require('typescript');

const HOSTNAME = 'https://global-openapi.bithumb.pro';

const spotFilePath = __dirname + '/mocks/static/spot.json';
// const mockedMarkets = JSON.parse(readFileSync(marketsFilePath, 'utf-8'));

/**
 * HTTP mocking scope for Bithumb master test
 * Should be as
 *
 * @param env
 */
module.exports = (env) => ({
    init: null,
    'Spot Wallet HTTP interface': {
        'ping()': () =>
            nock(HOSTNAME)
                .get('/openapi/v1/serverTime')
                .reply(200, { data: Date.now(), code: '0', msg: 'success' }),
        // 'fetchMarkets()': () =>
        //     nock(HOSTNAME)
        //         .get('/api/markets')
        //         .replyWithFile(200, marketsFilePath, {
        //             'Content-Type': 'application/json',
        //         }),
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
        'createOrder()': {
            'buy by market': () =>
                nock(HOSTNAME)
                    .matchHeader('Content-Type', 'application/json')
                    .post('/spot/placeOrder')
                    .query((q) => {
                        expect(q).toMatchObject({
                            apiKey: env.API_PUBLIC_KEY,
                            market: 'BTC-USDT',
                            side: 'buy',
                            type: 'market',
                            price: null,
                            size: 0.0004,
                        });

                        expect(q.msgNo).toBeDefined();
                        expect(q.timestamp).toBeDefined();
                        expect(q.signature).toBeDefined();
                        return true;
                    })
                    // TODO: change reply
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
                    .matchHeader('Content-Type', 'application/json')
                    .post('/spot/placeOrder', {
                        market: 'BTC-USDT',
                        side: 'sell',
                        type: 'market',
                        price: null,
                        size: 0.0004,
                    })
                    // TODO: change reply
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
                    .matchHeader('Content-Type', 'application/json')
                    .post('/spot/placeOrder', {
                        market: 'BTC-USDT',
                        type: 'limit',
                        side: 'buy',
                        size: 0.0004,
                        price: 35000,
                    })
                    // TODO: change reply
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
                    .matchHeader('Content-Type', 'application/json')
                    .post('/spot/placeOrder', {
                        market: 'BTC-USDT',
                        type: 'limit',
                        side: 'sell',
                        size: 0.0004,
                        price: 55000,
                    })
                    // TODO: change reply
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
                .matchHeader('Content-Type', 'application/json')
                .post('/spot/assetList')
                // TODO: change reply
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
                .matchHeader('Content-Type', 'application/json')
                // Order creation
                .post('/spot/placeOrder', {
                    market: 'USDT-USD',
                    type: 'limit',
                    side: 'buy',
                    size: 20,
                    price: 0.5,
                })
                // TODO: change reply
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
                .post(`/spot/cancelOrder`)
                .query((q) => {
                    expect(q).toMatchObject({
                        apiKey: env.API_PUBLIC_KEY,
                        orderId: 1, // TODO: check parameters
                        symbol: 'USDT-USD',
                    });
                    expect(q.msgNo).toBeDefined();
                    expect(q.timestamp).toBeDefined();
                    expect(q.signature).toBeDefined();
                    return true;
                })
                .reply(200),

        'fetchOrderById()': () =>
            nock(HOSTNAME)
                .matchHeader('Content-Type', 'application/json')
                // Order creation
                .post('/spot/placeOrder')
                .query({
                    market: 'USDT/USD',
                    type: 'limit',
                    side: 'buy',
                    size: 20,
                    price: 0.5,
                })
                // TODO: change reply
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
                .post('/spot/singleOrder')
                .query((q) => {
                    expect(q).toMatchObject({
                        apiKey: env.API_PUBLIC_KEY,
                        orderId: 1, // TODO: check parameters
                        symbol: 'USDT-USD',
                    });

                    expect(q.msgNo).toBeDefined();
                    expect(q.timestamp).toBeDefined();
                    expect(q.signature).toBeDefined();
                })
                // TODO: change reply
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
                .post(`/spot/cancelOrder`)
                .query((q) => {
                    expect(q).toMatchObject({
                        apiKey: env.API_PUBLIC_KEY,
                        orderId: 1, // TODO: check parameters
                        symbol: 'USDT-USD',
                    });
                    expect(q.msgNo).toBeDefined();
                    expect(q.timestamp).toBeDefined();
                    expect(q.signature).toBeDefined();
                    return true;
                })
                .reply(200),
    },
});
