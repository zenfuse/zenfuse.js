/* eslint-disable @cspell/spellchecker */
const nock = require('nock');

const HOSTNAME = 'https://api.kraken.com';

const assetPairsFilePath = __dirname + '/mocks/static/assetPairs.json';
const historyFilePath = __dirname + '/mocks/static/history.json';

/**
 * HTTP mocking scope for Kraken master test
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
                .get('/0/public/Time')
                .reply(200, {
                    error: [],
                    result: {
                        unixtime: Date().now(),
                        rfc1123: Date().now().toUTCString(),
                    },
                }),
        'fetchMarkets()': () =>
            nock(HOSTNAME)
                .get('/0/public/AssetPairs')
                .replyWithFile(200, assetPairsFilePath, {
                    'Content-Type': 'application/json',
                }),
        'fetchTickers()': () =>
            nock(HOSTNAME)
                .get('/0/public/AssetPairs')
                .replyWithFile(200, assetPairsFilePath, {
                    'Content-Type': 'application/json',
                }),
        //TODO: find a solution for all tickers request
        'fetchPrice()': () =>
            nock(HOSTNAME)
                .get('/0/public/Ticker')
                .replyWithFile(200, spotFilePath, {
                    'Content-Type': 'application/json',
                })
                .get('/0/public/Ticker')
                .query({ pair: 'BTCUSDT' })
                .reply(200, {
                    error: [],
                    result: {
                        XBTUSDT: {
                            a: ['21222.90000', '1', '1.000'],
                            b: ['21212.10000', '1', '1.000'],
                            c: ['21224.70000', '0.00668053'],
                            v: ['105.73443212', '549.64660532'],
                            p: ['21182.98219', '22105.03870'],
                            t: [1144, 5054],
                            l: ['20756.00000', '20756.00000'],
                            h: ['22278.00000', '23049.10000'],
                            o: '22136.30000',
                        },
                    },
                }),
        'fetchCandleHistory()': () =>
            nock(HOSTNAME)
                .get('/0/public/OHLC')
                .query({
                    pair: 'BTCUSDT',
                    interval: '1m',
                })
                .replyWithFile(200, historyFilePath, {
                    'Content-Type': 'application/json',
                }),
        'postOrder()': {
            'buy by market': () =>
                nock(HOSTNAME)
                    .matchHeader('API-KEY', env.API_PUBLIC_KEY)
                    .matchHeader('API-SIGN', Boolean)
                    .post('/0/private/AddOrder', (b) => {
                        expect(b).toMatchObject({
                            pair: toKrakenStyle(env.BUY_MARKET_ORDER.symbol),
                            type: 'buy',
                            ordertype: 'market',
                            price: null,
                            volume: toKrakenStyle(
                                env.BUY_MARKET_ORDER.quantity,
                            ),
                        });

                        expect(b.sz).toBeDefined();
                        return true;
                    })
                    .reply(201, {
                        error: [],
                        result: {
                            descr: {
                                order: `${env.BUY_MARKET_ORDER.side} ${env.BUY_MARKET_ORDER.quantity} XBTUSDT @ ${env.BUY_MARKET_ORDER.type}`,
                            },
                            txid: ['OUF4EM-FRGI2-MQMWZD'],
                        },
                    }),
            'sell by market': () =>
                nock(HOSTNAME)
                    .matchHeader('API-KEY', env.API_PUBLIC_KEY)
                    .matchHeader('API-SIGN', Boolean)
                    .post('/0/private/AddOrder', (b) => {
                        expect(b).toMatchObject({
                            pair: toKrakenStyle(env.SELL_MARKET_ORDER.symbol),
                            type: 'sell',
                            ordertype: 'market',
                            price: null,
                            volume: toKrakenStyle(
                                env.SELL_MARKET_ORDER.quantity,
                            ),
                        });

                        return true;
                    })
                    .reply(201, {
                        error: [],
                        result: {
                            descr: {
                                order: `${env.SELL_MARKET_ORDER.side} ${env.SELL_MARKET_ORDER.quantity} XBTUSDT @ ${env.SELL_MARKET_ORDER.type}`,
                            },
                            txid: ['OUF4EM-FRGI2-MQMWZD'],
                        },
                    }),
            'buy by limit': () =>
                nock(HOSTNAME)
                    .matchHeader('API-KEY', env.API_PUBLIC_KEY)
                    .matchHeader('API-SIGN', Boolean)
                    .post('/0/private/AddOrder', (b) => {
                        expect(b).toMatchObject({
                            pair: toKrakenStyle(env.BUY_LIMIT_ORDER.symbol),
                            type: 'buy',
                            ordertype: 'limit',
                            price: toKrakenStyle(env.BUY_LIMIT_ORDER.price),
                            volume: toKrakenStyle(env.BUY_LIMIT_ORDER.quantity),
                        });

                        return true;
                    })
                    .reply(201, {
                        error: [],
                        result: {
                            descr: {
                                order: `${env.BUY_LIMIT_ORDER.side} ${env.BUY_LIMIT_ORDER.quantity} XBTUSDT @ ${env.BUY_LIMIT_ORDER.type} ${env.BUY_LIMIT_ORDER.price}`,
                            },
                            txid: ['OUF4EM-FRGI2-MQMWZD'],
                        },
                    }),
            'sell by limit': () =>
                nock(HOSTNAME)
                    .matchHeader('API-KEY', env.API_PUBLIC_KEY)
                    .matchHeader('API-SIGN', Boolean)
                    .post('/0/private/AddOrder', (b) => {
                        expect(b).toMatchObject({
                            pair: toKrakenStyle(env.BUY_LIMIT_ORDER.symbol),
                            type: 'sell',
                            ordertype: 'limit',
                            price: toKrakenStyle(env.BUY_LIMIT_ORDER.price),
                            volume: toKrakenStyle(env.BUY_LIMIT_ORDER.quantity),
                        });

                        return true;
                    })
                    .reply(201, {
                        error: [],
                        result: {
                            descr: {
                                order: `${env.SELL_LIMIT_ORDER.side} ${env.SELL_LIMIT_ORDER.quantity} XBTUSDT @ ${env.SELL_LIMIT_ORDER.type} ${env.SELL_LIMIT_ORDER.price}`,
                            },
                            txid: ['OUF4EM-FRGI2-MQMWZD'],
                        },
                    }),
        },
        'fetchBalances()': () =>
            nock(HOSTNAME)
                .matchHeader('API-KEY', env.API_PUBLIC_KEY)
                .matchHeader('API-SIGN', Boolean)
                .get('/0/private/Balance')
                .reply(200, {
                    error: [],
                    result: {
                        ZUSD: '171288.6158',
                        ZEUR: '504861.8946',
                        ZGBP: '459567.9171',
                        ZAUD: '500000.0000',
                        ZCAD: '500000.0000',
                        CHF: '500000.0000',
                        XXBT: '1011.1908877900',
                        XXRP: '100000.00000000',
                        XLTC: '2000.0000000000',
                        XETH: '818.5500000000',
                        XETC: '1000.0000000000',
                        XREP: '1000.0000000000',
                        XXMR: '1000.0000000000',
                        USDT: '500000.00000000',
                        DASH: '1000.0000000000',
                        GNO: '1000.0000000000',
                        EOS: '1000.0000000000',
                        BCH: '1016.6005000000',
                        ADA: '100000.00000000',
                        QTUM: '1000.0000000000',
                        XTZ: '100000.00000000',
                        ATOM: '100000.00000000',
                        SC: '9999.9999999999',
                        LSK: '1000.0000000000',
                        WAVES: '1000.0000000000',
                        ICX: '1000.0000000000',
                        BAT: '1000.0000000000',
                        OMG: '1000.0000000000',
                        LINK: '1000.0000000000',
                        DAI: '9999.9999999999',
                        PAXG: '1000.0000000000',
                        ALGO: '100000.00000000',
                        USDC: '100000.00000000',
                        TRX: '100000.00000000',
                        DOT: '2.5000000000',
                        OXT: '1000.0000000000',
                        'ETH2.S': '198.3970800000',
                        ETH2: '2.5885574330',
                        'USD.M': '1213029.2780',
                    },
                }),
        'cancelOrder()': () =>
            nock(HOSTNAME)
                .matchHeader('API-KEY', env.API_PUBLIC_KEY)
                .matchHeader('API-SIGN', Boolean)
                // Order creation
                .post('/0/private/AddOrder', (b) => {
                    expect(b).toMatchObject({
                        pair: toKrakenStyle(env.NOT_EXECUTABLE_ORDER.symbol),
                        type: toKrakenStyle(env.NOT_EXECUTABLE_ORDER.side),
                        ordertype: toKrakenStyle(env.NOT_EXECUTABLE_ORDER.type),
                        price: toKrakenStyle(env.NOT_EXECUTABLE_ORDER.price),
                        volume: toKrakenStyle(
                            env.NOT_EXECUTABLE_ORDER.quantity,
                        ),
                    });

                    return true;
                })
                .reply(201, {
                    error: [],
                    result: {
                        descr: {
                            order: `${env.NOT_EXECUTABLE_ORDER.side} ${env.NOT_EXECUTABLE_ORDER.quantity} XBTUSDT @ ${env.NOT_EXECUTABLE_ORDER.type} ${env.NOT_EXECUTABLE_ORDER.price}`,
                        },
                        txid: ['OUF4EM-FRGI2-MQMWZD'],
                    },
                })
                // Order deletion
                .matchHeader('API-KEY', env.API_PUBLIC_KEY)
                .matchHeader('API-SIGN', Boolean)
                .post('/0/private/CancelOrder', (b) => {
                    expect(b).toMatchObject({
                        txid: 'OUF4EM-FRGI2-MQMWZD',
                    });

                    return true;
                })
                .reply(200, {
                    error: [],
                    result: {
                        count: 1,
                    },
                }),
        'cancelOrderById()': () =>
            nock(HOSTNAME)
                .matchHeader('API-KEY', env.API_PUBLIC_KEY)
                .matchHeader('API-SIGN', Boolean)
                // Order creation
                .post('/0/private/AddOrder', (b) => {
                    expect(b).toMatchObject({
                        pair: toKrakenStyle(env.NOT_EXECUTABLE_ORDER.symbol),
                        type: toKrakenStyle(env.NOT_EXECUTABLE_ORDER.side),
                        ordertype: toKrakenStyle(env.NOT_EXECUTABLE_ORDER.type),
                        price: toKrakenStyle(env.NOT_EXECUTABLE_ORDER.price),
                        volume: toKrakenStyle(
                            env.NOT_EXECUTABLE_ORDER.quantity,
                        ),
                    });

                    return true;
                })
                .reply(201, {
                    error: [],
                    result: {
                        descr: {
                            order: `${env.NOT_EXECUTABLE_ORDER.side} ${env.NOT_EXECUTABLE_ORDER.quantity} XBTUSDT @ ${env.NOT_EXECUTABLE_ORDER.type} ${env.NOT_EXECUTABLE_ORDER.price}`,
                        },
                        txid: ['OUF4EM-FRGI2-MQMWZD'],
                    },
                })
                // Order deletion
                .matchHeader('API-KEY', env.API_PUBLIC_KEY)
                .matchHeader('API-SIGN', Boolean)
                .post('/0/private/CancelOrder', (b) => {
                    expect(b).toMatchObject({
                        txid: 'OUF4EM-FRGI2-MQMWZD',
                    });

                    return true;
                })
                .reply(200, {
                    error: [],
                    result: {
                        count: 1,
                    },
                }),
        'fetchOrderById()': () =>
            nock(HOSTNAME)
                .matchHeader('API-KEY', env.API_PUBLIC_KEY)
                .matchHeader('API-SIGN', Boolean)
                // Order creation
                .post('/0/private/AddOrder', (b) => {
                    expect(b).toMatchObject({
                        pair: toKrakenStyle(env.NOT_EXECUTABLE_ORDER.symbol),
                        type: toKrakenStyle(env.NOT_EXECUTABLE_ORDER.side),
                        ordertype: toKrakenStyle(env.NOT_EXECUTABLE_ORDER.type),
                        price: toKrakenStyle(env.NOT_EXECUTABLE_ORDER.price),
                        volume: toKrakenStyle(
                            env.NOT_EXECUTABLE_ORDER.quantity,
                        ),
                    });

                    return true;
                })
                .reply(201, {
                    error: [],
                    result: {
                        descr: {
                            order: `${env.NOT_EXECUTABLE_ORDER.side} ${env.NOT_EXECUTABLE_ORDER.quantity} XBTUSDT @ ${env.NOT_EXECUTABLE_ORDER.type} ${env.NOT_EXECUTABLE_ORDER.price}`,
                        },
                        txid: ['OUF4EM-FRGI2-MQMWZD'],
                    },
                })
                // Order status fetch
                .matchHeader('API-KEY', env.API_PUBLIC_KEY)
                .matchHeader('API-SIGN', Boolean)
                .post('/0/private/QueryOrders', (b) => {
                    expect(b).toMatchObject({
                        txid: 'OUF4EM-FRGI2-MQMWZD',
                    });

                    return true;
                })
                .reply(200, {
                    error: [],
                    result: {
                        'OUF4EM-FRGI2-MQMWZD': {
                            refid: null,
                            userref: 0,
                            status: 'open',
                            reason: null,
                            opentm: 1616665496.7808,
                            closetm: 1616665499.1922,
                            starttm: 0,
                            expiretm: 0,
                            descr: {
                                pair: toKrakenStyle(
                                    env.NOT_EXECUTABLE_ORDER.symbol,
                                ),
                                type: toKrakenStyle(
                                    env.NOT_EXECUTABLE_ORDER.side,
                                ),
                                ordertype: toKrakenStyle(
                                    env.NOT_EXECUTABLE_ORDER.type,
                                ),
                                price: toKrakenStyle(
                                    env.NOT_EXECUTABLE_ORDER.price,
                                ),
                                volume: toKrakenStyle(
                                    env.NOT_EXECUTABLE_ORDER.quantity,
                                ),
                                leverage: 'none',
                                order: `${toKrakenStyle(
                                    env.NOT_EXECUTABLE_ORDER.side,
                                )} ${toKrakenStyle(
                                    env.NOT_EXECUTABLE_ORDER.quantity,
                                )} ${toKrakenStyle(
                                    env.NOT_EXECUTABLE_ORDER.symbol,
                                )} @ ${toKrakenStyle(
                                    env.NOT_EXECUTABLE_ORDER.type,
                                )} ${toKrakenStyle(
                                    env.NOT_EXECUTABLE_ORDER.price,
                                )}`,
                                close: '',
                            },
                            vol: toKrakenStyle(
                                env.NOT_EXECUTABLE_ORDER.quantity,
                            ),
                            vol_exec: '0',
                            cost: '37526.2',
                            fee: '37.5',
                            price: '30021.0',
                            stopprice: '0.00000',
                            limitprice: '0.00000',
                            misc: '',
                            oflags: 'fciq',
                            trigger: 'index',
                            trades: ['TZX2WP-XSEOP-FP7WYR'],
                        },
                    },
                })
                // Order deletion
                .matchHeader('API-KEY', env.API_PUBLIC_KEY)
                .matchHeader('API-SIGN', Boolean)
                .post('/0/private/CancelOrder', (b) => {
                    expect(b).toMatchObject({
                        txid: 'OUF4EM-FRGI2-MQMWZD',
                    });

                    return true;
                })
                .reply(200, {
                    error: [],
                    result: {
                        count: 1,
                    },
                }),
    },
    'Error Handling': {
        'INVALID_CREDENTIALS code': () =>
            nock(HOSTNAME)
                .matchHeader('API-KEY', 'invalidPublicKey')
                .matchHeader('API-SIGN', Boolean)
                .get('/api/v5/trade/orders-pending')
                .reply(401, { msg: 'Invalid OK-ACCESS-KEY', code: '50111' }),

        'INSUFFICIENT_FUNDS code': () =>
            nock(HOSTNAME)
                .matchHeader('API-KEY', env.API_PUBLIC_KEY)
                .matchHeader('API-SIGN', Boolean)
                .post('/api/v5/trade/order', () => true)
                .query(() => true)
                .reply(400, {
                    code: '1',
                    data: [
                        {
                            clOrdId: 'b15',
                            ordId: '',
                            sCode: '51008',
                            sMsg: 'Order placement failed due to insufficient balance ',
                            tag: '',
                        },
                    ],
                    msg: 'Operation failed.',
                }),
        'UNKNOWN_EXCEPTION code': () =>
            nock(HOSTNAME)
                .matchHeader('API-KEY', env.API_PUBLIC_KEY)
                .matchHeader('API-SIGN', Boolean)
                .post('/api/v5/account/set-leverage')
                .query(() => true)
                .reply(400, {
                    code: '50000',
                    data: [],
                    msg: 'Body can not be empty.',
                }),
    },
});

const toKrakenStyle = (value) => value.toString().replace('/', '');
