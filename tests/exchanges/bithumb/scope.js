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
                            symbol: 'BTC-USDT',
                            type: 'market',
                            side: 'buy',                            
                            price: '-1',
                            quantity: '0.0004',
                        });

                        expect(q.apiKey).toBeDefined();
                        expect(q.msgNo).toBeDefined();
                        expect(q.timestamp).toBeDefined();
                        expect(q.signature).toBeDefined();
                        return true;
                    })
                    .reply(201, {
                        data: {
                            orderId: "23132134242",
                            symbol: "BTC-USDT"
                           },
                        code: "0",
                        msg: "success",
                        timestamp: 1551346473238,
                        params: []
                    }),
            'sell by market': () =>
                nock(HOSTNAME)
                    .matchHeader('Content-Type', 'application/json')
                    .post('/spot/placeOrder')
                    .query((q) => {
                        expect(q).toMatchObject({
                            symbol: 'BTC-USDT',
                            type: 'market',
                            side: 'sell',                            
                            price: '-1',
                            quantity: '0.0004',
                        });

                        expect(q.apiKey).toBeDefined();
                        expect(q.msgNo).toBeDefined();
                        expect(q.timestamp).toBeDefined();
                        expect(q.signature).toBeDefined();
                        return true;
                    })
                    .reply(201, {
                        data: {
                            orderId:"23132134242",
                            symbol:"BTC-USDT"
                           },
                        code: "0",
                        msg: "success",
                        timestamp: 1551346473238,
                        params: []
                    }),
            'buy by limit': () =>
                nock(HOSTNAME)
                    .matchHeader('Content-Type', 'application/json')
                    .post('/spot/placeOrder')
                    .query((q) => {
                        expect(q).toMatchObject({
                            symbol: 'BTC-USDT',
                            type: 'limit',
                            side: 'buy',                            
                            price: '35000',
                            quantity: '0.0004',
                        });

                        expect(q.apiKey).toBeDefined();
                        expect(q.msgNo).toBeDefined();
                        expect(q.timestamp).toBeDefined();
                        expect(q.signature).toBeDefined();
                        return true;
                    })
                    .reply(201, {
                        data: {
                            orderId:"23132134242",
                            symbol:"BTC-USDT"
                           },
                        code: "0",
                        msg: "success",
                        timestamp: 1551346473238,
                        params: []
                    }),
            'sell by limit': () =>
                nock(HOSTNAME)
                    .matchHeader('Content-Type', 'application/json')
                    .post('/spot/placeOrder')
                    .query((q) => {
                        expect(q).toMatchObject({
                            symbol: 'BTC-USDT',
                            type: 'limit',
                            side: 'sell',                            
                            price: '55000',
                            quantity: '0.0004',
                        });

                        expect(q.apiKey).toBeDefined();
                        expect(q.msgNo).toBeDefined();
                        expect(q.timestamp).toBeDefined();
                        expect(q.signature).toBeDefined();
                        return true;
                    })
                    .reply(201, {
                        data: {
                            orderId:"23132134242",
                            symbol:"BTC-USDT"
                           },
                        code: "0",
                        msg: "success",
                        timestamp: 1551346473238,
                        params: []
                    }),
        },
        'fetchBalances()': () =>
            nock(HOSTNAME)
                .matchHeader('Content-Type', 'application/json')
                .post('/spot/assetList')
                .query((q) => {
                    expect(q).toMatchObject({
                        assetType: 'wallet',
                    });

                    expect(q.apiKey).toBeDefined();
                    expect(q.msgNo).toBeDefined();
                    expect(q.timestamp).toBeDefined();
                    expect(q.signature).toBeDefined();
                    return true;
                })
                // TODO: change reply
                .reply(200, {
                    data: [
                         {
                          coinType: "BTC",
                          count: "100",
                          frozen: "10",
                          btcQuantity: "110",
                          type: "1"
                        }
                      ],
                    code: "0",
                    msg: "success",
                    timestamp: 1551346473238,
                    params: []
                }),

        'cancelOrderById()': () =>
            nock(HOSTNAME)
                .matchHeader('Content-Type', 'application/json')
                // Order creation
                .post('/spot/placeOrder')
                .query((q) => {
                    expect(q).toMatchObject({
                        symbol: 'USDT-USD',
                        type: 'limit',
                        side: 'buy',
                        quantity: '20',
                        price: '0.5',
                    });

                    expect(q.apiKey).toBeDefined();
                    expect(q.msgNo).toBeDefined();
                    expect(q.timestamp).toBeDefined();
                    expect(q.signature).toBeDefined();
                    return true;
                })
                .reply(201, {
                    data: {
                        orderId: "23132134242",
                        symbol: "USDT-USD",
                       },
                    code: "0",
                    msg: "success",
                    timestamp: 1551346473238,
                    params: [],
                })
                // Order deletion
                .post(`/spot/cancelOrder`)
                .query((q) => {
                    expect(q).toMatchObject({
                        orderId: "23132134242",
                        symbol: "",
                    });

                    expect(q.apiKey).toBeDefined();
                    expect(q.msgNo).toBeDefined();
                    expect(q.timestamp).toBeDefined();
                    expect(q.signature).toBeDefined();
                    return true;
                })
                .reply(200, {
                    code: "0",
                    msg: "success",
                    timestamp: 1551346473238,
                    params: [],
                }),

        'fetchOrderById()': () =>
            nock(HOSTNAME)
                .matchHeader('Content-Type', 'application/json')
                // Order creation
                .post('/spot/placeOrder')
                .query((q) => {
                    expect(q).toMatchObject({
                        symbol: 'USDT-USD',
                        type: 'limit',
                        side: 'buy',
                        quantity: '20',
                        price: '0.5',
                    });

                    expect(q.apiKey).toBeDefined();
                    expect(q.msgNo).toBeDefined();
                    expect(q.timestamp).toBeDefined();
                    expect(q.signature).toBeDefined();
                    return true;
                })
                .reply(201, {
                    data: {
                        orderId: "23132134242",
                        symbol: "USDT-USD",
                       },
                    code: "0",
                    msg: "success",
                    timestamp: 1551346473238,
                    params: [],
                })
                // Order status fetch
                .post('/spot/singleOrder')
                .query((q) => {
                    expect(q).toMatchObject({
                        orderId: '23132134242',
                        symbol: '',
                    });

                    expect(q.apiKey).toBeDefined();
                    expect(q.msgNo).toBeDefined();
                    expect(q.timestamp).toBeDefined();
                    expect(q.signature).toBeDefined();
                    return true;
                })
                .reply(200, {
                    data:{
                        orderId: "23132134242",
                        symbol: "USDT-USD",
                        price: "0.5",
                        tradedNum: "0.01",
                        quantity: "20",
                        avgPrice: "0",
                        status: "pending",
                        type: "limit",
                        side: "buy",
                        createTime: "1551346473238",
                        tradeTotal: "0.5",
                      },
                    code: "0",
                    msg: "success",
                    timestamp: 1551346473238,
                    params: [],
                })
                // Order deletion
                .post(`/spot/cancelOrder`)
                .query((q) => {
                    expect(q).toMatchObject({
                        orderId: "23132134242",
                        symbol: "",
                    });

                    expect(q.apiKey).toBeDefined();
                    expect(q.msgNo).toBeDefined();
                    expect(q.timestamp).toBeDefined();
                    expect(q.signature).toBeDefined();
                    return true;
                })
                .reply(200, {
                    code: "0",
                    msg: "success",
                    timestamp: 1551346473238,
                    params: [],
                }),
    },
});
