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
                    .get('/api/v5/market/ticker')
                    .query({
                        instId: toOkxStyle(env.BUY_MARKET_ORDER.symbol),
                    })
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
                    })
                    .post('/api/v5/trade/order', (b) => {
                        expect(b).toMatchObject({
                            instId: toOkxStyle(env.BUY_MARKET_ORDER.symbol),
                            tdMode: 'cash',
                            side: 'buy',
                            ordType: 'market',
                            px: null,
                        });

                        expect(b.sz).toBeDefined();
                        return true;
                    })
                    .reply(201, {
                        code: '0',
                        msg: '',
                        data: [
                            {
                                clOrdId: '',
                                ordId: '312269865356374016',
                                tag: '',
                                sCode: '0',
                                sMsg: '',
                            },
                        ],
                    }),
            'sell by market': () =>
                nock(HOSTNAME)
                    .matchHeader('OK-ACCESS-KEY', env.API_PUBLIC_KEY)
                    .matchHeader('OK-ACCESS-TIMESTAMP', Boolean)
                    .matchHeader('OK-ACCESS-SIGN', Boolean)
                    .matchHeader('OK-ACCESS-PASSPHRASE', Boolean)
                    .post('/api/v5/trade/order', (b) => {
                        expect(b).toMatchObject({
                            instId: toOkxStyle(env.SELL_MARKET_ORDER.symbol),
                            tdMode: 'cash',
                            side: 'sell',
                            ordType: 'market',
                            px: null,
                            sz: toOkxStyle(env.SELL_MARKET_ORDER.quantity),
                        });

                        return true;
                    })
                    .reply(201, {
                        code: '0',
                        msg: '',
                        data: [
                            {
                                clOrdId: '',
                                ordId: '312269865356374016',
                                tag: '',
                                sCode: '0',
                                sMsg: '',
                            },
                        ],
                    }),
            'buy by limit': () =>
                nock(HOSTNAME)
                    .matchHeader('OK-ACCESS-KEY', env.API_PUBLIC_KEY)
                    .matchHeader('OK-ACCESS-TIMESTAMP', Boolean)
                    .matchHeader('OK-ACCESS-SIGN', Boolean)
                    .matchHeader('OK-ACCESS-PASSPHRASE', Boolean)
                    .post('/api/v5/trade/order', (b) => {
                        expect(b).toMatchObject({
                            instId: toOkxStyle(env.BUY_LIMIT_ORDER.symbol),
                            tdMode: 'cash',
                            side: 'buy',
                            ordType: 'limit',
                            px: toOkxStyle(env.BUY_LIMIT_ORDER.price),
                            sz: toOkxStyle(env.BUY_LIMIT_ORDER.quantity),
                        });

                        return true;
                    })
                    .reply(201, {
                        code: '0',
                        msg: '',
                        data: [
                            {
                                clOrdId: '',
                                ordId: '312269865356374016',
                                tag: '',
                                sCode: '0',
                                sMsg: '',
                            },
                        ],
                    }),
            'sell by limit': () =>
                nock(HOSTNAME)
                    .matchHeader('OK-ACCESS-KEY', env.API_PUBLIC_KEY)
                    .matchHeader('OK-ACCESS-TIMESTAMP', Boolean)
                    .matchHeader('OK-ACCESS-SIGN', Boolean)
                    .matchHeader('OK-ACCESS-PASSPHRASE', Boolean)
                    .post('/api/v5/trade/order', (b) => {
                        expect(b).toMatchObject({
                            instId: toOkxStyle(env.SELL_LIMIT_ORDER.symbol),
                            tdMode: 'cash',
                            side: 'sell',
                            ordType: 'limit',
                            px: toOkxStyle(env.SELL_LIMIT_ORDER.price),
                            sz: toOkxStyle(env.SELL_LIMIT_ORDER.quantity),
                        });

                        return true;
                    })
                    .reply(201, {
                        code: '0',
                        msg: '',
                        data: [
                            {
                                clOrdId: '',
                                ordId: '312269865356374016',
                                tag: '',
                                sCode: '0',
                                sMsg: '',
                            },
                        ],
                    }),
        },
        'fetchBalances()': () =>
            nock(HOSTNAME)
                .matchHeader('OK-ACCESS-KEY', env.API_PUBLIC_KEY)
                .matchHeader('OK-ACCESS-TIMESTAMP', Boolean)
                .matchHeader('OK-ACCESS-SIGN', Boolean)
                .matchHeader('OK-ACCESS-PASSPHRASE', Boolean)
                .get('/api/v5/account/balance')
                .reply(200, {
                    code: '0',
                    data: [
                        {
                            adjEq: '10679688.0460531643092577',
                            details: [
                                {
                                    availBal: '',
                                    availEq: '9930359.9998',
                                    cashBal: '9930359.9998',
                                    ccy: 'USDT',
                                    crossLiab: '0',
                                    disEq: '9439737.0772999514',
                                    eq: '9930359.9998',
                                    eqUsd: '9933041.196999946',
                                    frozenBal: '0',
                                    interest: '0',
                                    isoEq: '0',
                                    isoLiab: '0',
                                    isoUpl: '0',
                                    liab: '0',
                                    maxLoan: '10000',
                                    mgnRatio: '',
                                    notionalLever: '',
                                    ordFrozen: '0',
                                    twap: '0',
                                    uTime: '1620722938250',
                                    upl: '0',
                                    uplLiab: '0',
                                    stgyEq: '0',
                                },
                                {
                                    availBal: '',
                                    availEq: '33.6799714158199414',
                                    cashBal: '33.2009985',
                                    ccy: 'BTC',
                                    crossLiab: '0',
                                    disEq: '1239950.9687532129092577',
                                    eq: '33.771820625136023',
                                    eqUsd: '1239950.9687532129092577',
                                    frozenBal: '0.0918492093160816',
                                    interest: '0',
                                    isoEq: '0',
                                    isoLiab: '0',
                                    isoUpl: '0',
                                    liab: '0',
                                    maxLoan: '1453.92289531493594',
                                    mgnRatio: '',
                                    notionalLever: '',
                                    ordFrozen: '0',
                                    twap: '0',
                                    uTime: '1620722938250',
                                    upl: '0.570822125136023',
                                    uplLiab: '0',
                                    stgyEq: '0',
                                },
                            ],
                            imr: '3372.2942371050594217',
                            isoEq: '0',
                            mgnRatio: '70375.35408747017',
                            mmr: '134.8917694842024',
                            notionalUsd: '33722.9423710505978888',
                            ordFroz: '0',
                            totalEq: '11172992.1657531589092577',
                            uTime: '1623392334718',
                        },
                    ],
                    msg: '',
                }),
        'cancelOrderById()': () =>
            nock(HOSTNAME)
                .matchHeader('OK-ACCESS-KEY', env.API_PUBLIC_KEY)
                .matchHeader('OK-ACCESS-TIMESTAMP', Boolean)
                .matchHeader('OK-ACCESS-SIGN', Boolean)
                .matchHeader('OK-ACCESS-PASSPHRASE', Boolean)
                // Order creation
                .post('/api/v5/trade/order', (b) => {
                    expect(b).toMatchObject({
                        instId: toOkxStyle(env.NOT_EXECUTABLE_ORDER.symbol),
                        tdMode: 'cash',
                        side: toOkxStyle(env.NOT_EXECUTABLE_ORDER.side),
                        ordType: toOkxStyle(env.NOT_EXECUTABLE_ORDER.type),
                        px: toOkxStyle(env.NOT_EXECUTABLE_ORDER.price),
                        sz: toOkxStyle(env.NOT_EXECUTABLE_ORDER.quantity),
                    });

                    return true;
                })
                .reply(201, {
                    code: '0',
                    msg: '',
                    data: [
                        {
                            clOrdId: '',
                            ordId: '312269865356374016',
                            tag: '',
                            sCode: '0',
                            sMsg: '',
                        },
                    ],
                })
                // Order deletion
                .matchHeader('OK-ACCESS-KEY', env.API_PUBLIC_KEY)
                .matchHeader('OK-ACCESS-TIMESTAMP', Boolean)
                .matchHeader('OK-ACCESS-SIGN', Boolean)
                .matchHeader('OK-ACCESS-PASSPHRASE', Boolean)
                .post('/api/v5/trade/cancel-order', (b) => {
                    expect(b).toMatchObject({
                        instId: toOkxStyle(env.NOT_EXECUTABLE_ORDER.symbol),
                        ordId: '312269865356374016',
                    });

                    return true;
                })
                .reply(200, {
                    code: '0',
                    msg: '',
                    data: [
                        {
                            clOrdId: '',
                            ordId: '312269865356374016',
                            sCode: '0',
                            sMsg: '',
                        },
                    ],
                }),
        'fetchOrderById()': () =>
            nock(HOSTNAME)
                .matchHeader('OK-ACCESS-KEY', env.API_PUBLIC_KEY)
                .matchHeader('OK-ACCESS-TIMESTAMP', Boolean)
                .matchHeader('OK-ACCESS-SIGN', Boolean)
                .matchHeader('OK-ACCESS-PASSPHRASE', Boolean)
                // Order creation
                .post('/api/v5/trade/order', (b) => {
                    expect(b).toMatchObject({
                        instId: toOkxStyle(env.NOT_EXECUTABLE_ORDER.symbol),
                        tdMode: 'cash',
                        side: toOkxStyle(env.NOT_EXECUTABLE_ORDER.side),
                        ordType: toOkxStyle(env.NOT_EXECUTABLE_ORDER.type),
                        px: toOkxStyle(env.NOT_EXECUTABLE_ORDER.price),
                        sz: toOkxStyle(env.NOT_EXECUTABLE_ORDER.quantity),
                    });

                    return true;
                })
                .reply(201, {
                    code: '0',
                    msg: '',
                    data: [
                        {
                            clOrdId: '',
                            ordId: '312269865356374016',
                            tag: '',
                            sCode: '0',
                            sMsg: '',
                        },
                    ],
                })
                // Order status fetch
                .matchHeader('OK-ACCESS-KEY', env.API_PUBLIC_KEY)
                .matchHeader('OK-ACCESS-TIMESTAMP', Boolean)
                .matchHeader('OK-ACCESS-SIGN', Boolean)
                .matchHeader('OK-ACCESS-PASSPHRASE', Boolean)
                .get('/api/v5/trade/order')
                .query({ instId: 'BTC-USDT', ordId: '312269865356374016'})
                .reply(200, {
                    code: "0",
                    msg: "",
                    data: [
                      {
                        instType: "SPOT",
                        instId: "BTC-USDT",
                        ccy: "",
                        ordId: "312269865356374016",
                        clOrdId: "",
                        tag: "",
                        px: env.NOT_EXECUTABLE_ORDER.price,
                        sz: env.NOT_EXECUTABLE_ORDER.quantity,
                        pnl: "5",
                        ordType: "limit",
                        side: "buy",
                        posSide: "long",
                        tdMode: "isolated",
                        accFillSz: "0",
                        fillPx: "0",
                        tradeId: "0",
                        fillSz: "0",
                        fillTime: "0",
                        state: "live",
                        avgPx: "0",
                        lever: "20",
                        tpTriggerPx: "",
                        tpTriggerPxType: "last",
                        tpOrdPx: "",
                        slTriggerPx: "",
                        slTriggerPxType: "last",
                        slOrdPx: "",
                        feeCcy: "",
                        fee: "",
                        rebateCcy: "",
                        rebate: "",
                        tgtCcy: "",
                        category: "",
                        uTime: Date.now(),
                        cTime: Date.now()
                      }
                    ]
                  })
                // .get('/api/v5/trade/orders-pending')
                // .reply(200, {
                //     code: '0',
                //     msg: '',
                //     data: [
                //         {
                //             accFillSz: '0',
                //             avgPx: '',
                //             cTime: '1618235248028',
                //             category: 'normal',
                //             ccy: '',
                //             clOrdId: '',
                //             fee: '0',
                //             feeCcy: 'BTC',
                //             fillPx: '',
                //             fillSz: '0',
                //             fillTime: '',
                //             instId: 'BTC-USDT',
                //             instType: 'SPOT',
                //             lever: '5.6',
                //             ordId: '312269865356374016',
                //             ordType: 'limit',
                //             pnl: '0',
                //             posSide: 'net',
                //             px: '59200',
                //             rebate: '0',
                //             rebateCcy: 'USDT',
                //             side: 'buy',
                //             slOrdPx: '',
                //             slTriggerPx: '',
                //             slTriggerPxType: 'last',
                //             state: 'live',
                //             sz: '1',
                //             tag: '',
                //             tgtCcy: '',
                //             tdMode: 'cross',
                //             source: '',
                //             tpOrdPx: '',
                //             tpTriggerPx: '',
                //             tpTriggerPxType: 'last',
                //             tradeId: '',
                //             uTime: '1618235248028',
                //         },
                //     ],
                // })
                // Order deletion
                .matchHeader('OK-ACCESS-KEY', env.API_PUBLIC_KEY)
                .matchHeader('OK-ACCESS-TIMESTAMP', Boolean)
                .matchHeader('OK-ACCESS-SIGN', Boolean)
                .matchHeader('OK-ACCESS-PASSPHRASE', Boolean)
                .post('/api/v5/trade/cancel-order', (b) => {
                    expect(b).toMatchObject({
                        instId: toOkxStyle(env.NOT_EXECUTABLE_ORDER.symbol),
                        ordId: '312269865356374016',
                    });

                    return true;
                })
                .reply(200, {
                    code: '0',
                    msg: '',
                    data: [
                        {
                            clOrdId: '',
                            ordId: '312269865356374016',
                            sCode: '0',
                            sMsg: '',
                        },
                    ],
                }),
    },
});

const toOkxStyle = (value) => value.toString().replace('/', '-');
