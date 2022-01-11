/* eslint-disable no-undef */
const { readFileSync } = require('fs');
const nock = require('nock');

const checkProcessHasVariables = require('../../helpers/validateEnv');
const { FTX } = require('../../../src/index.js'); // zenfuse itself

if (isEnd2EndTest) {
    checkProcessHasVariables(['FTX_PUBLIC_KEY', 'FTX_SECRET_KEY']);
}

const API_PUBLIC_KEY = process.env.FTX_PUBLIC_KEY || 'DUMMY_PUBLIC_KEY';
const API_SECRET_KEY = process.env.FTX_SECRET_KEY || 'DUMMY_SECRET_KEY';

const HOSTNAME = 'https://ftx.com/';

/**
 * @typedef {import('../../../src/exchanges/ftx/wallets/spot.js')} FtxSpot
 */

// TODO: Make test for FTX
describe.skip('Ftx Options usage', () => {
    /**
     * @type {FtxSpot}
     */
    let ftx;

    describe('useCache', () => {
        it('should use cache by default', async () => {
            const mockFilePath = __dirname + '/mocks/static/markets.json';
            nock(HOSTNAME)
                .get('/api/v3/exchangeInfo')
                .replyWithFile(200, mockFilePath, {
                    'Content-Type': 'application/json',
                });

            ftx = new FTX['spot']();

            await ftx.cache.globalCache.updatingPromise;

            // TODO: Find beter way to check cache
            expect(ftx.cache.globalCache.has('tickers')).toBe(true);
            expect(ftx.cache.globalCache.has('symbols')).toBe(true);
            expect(ftx.cache.globalCache.has('parsedSymbols')).toBe(true);

            // scope.done(); TODO: Somehow this thing not working
        });

        it.skip('should not use when `useCache: false` specified', () => {
            ftx = new FTX['spot']({
                useCache: false,
            });

            expect(ftx.cache).toBeUndefined();
        });
    });
});

///////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////  FTX HTTP INTERFACE  /////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////

// TODO: Make test for FTX
describe('FTX Spot Wallet HTTP interface', () => {
    /**
     * @type {FtxSpot}
     */
    let ftx;

    beforeAll(() => {
        ftx = new FTX['spot']();
    });

    describe.skip('ping()', () => {
        it('should be defined', () => {
            expect(ftx.ping).toBeDefined();
        });
        it('should pings :)', async () => {
            const scope = nock(HOSTNAME).get('/api/v3/ping').reply(200, {});

            await ftx.ping();

            scope.done();
        });
    });

    describe('fetchMarkets()', () => {
        let result;

        const mockFilePath = __dirname + '/mocks/static/markets.json';
        const mockedMarkets = JSON.parse(readFileSync(mockFilePath, 'utf-8'));
        const scope = nock(HOSTNAME)
            .get('/api/markets')
            .replyWithFile(200, mockFilePath, {
                'Content-Type': 'application/json',
            });

        afterAll(() => {
            if (isTestSuiteFailed) return;
            scope.done();
        });

        it('should be defined', () => {
            expect(ftx.fetchMarkets).toBeDefined();
        });

        it('should fetch without errors', async () => {
            result = await ftx.fetchMarkets();
        });

        it('should have valid originalResponse', () => {
            if (isEnd2EndTest) {
                expect(
                    result[Symbol.for('zenfuse.originalPayload')],
                ).toBeInstanceOf(Object);
            }

            if (isIntegrationTest) {
                expect(
                    result[Symbol.for('zenfuse.originalPayload')],
                ).toMatchObject(mockedMarkets);
            }
        });

        it('should return valid schema', () => {
            const schema = {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        symbol: {
                            type: 'string',
                        },
                        baseTicker: {
                            type: 'string',
                        },
                        quoteTicker: {
                            type: 'string',
                        },
                    },
                    required: ['symbol', 'baseTicker', 'quoteTicker'],
                },
            };
            expect(result).toMatchSchema(schema);
        });
    });

    describe('fetchTickers()', () => {
        let result;

        let mockFilePath;
        let mockedMarkets;
        let scope = { done() {} };

        if (isIntegrationTest) {
            mockFilePath = __dirname + '/mocks/static/markets.json';
            mockedMarkets = JSON.parse(readFileSync(mockFilePath, 'utf-8'));
            scope = nock(HOSTNAME)
                .get('/api/markets')
                .replyWithFile(200, mockFilePath, {
                    'Content-Type': 'application/json',
                });
        }

        afterAll(() => {
            if (isTestSuiteFailed) return;
            scope.done();
        });

        it('should be defined', () => {
            expect(ftx.fetchTickers).toBeDefined();
        });

        it('should fetch without errors', async () => {
            result = await ftx.fetchTickers();
        });

        it('should have valid originalResponse', () => {
            if (isEnd2EndTest) {
                expect(
                    result[Symbol.for('zenfuse.originalPayload')],
                ).toBeInstanceOf(Object);
            }

            if (isIntegrationTest) {
                expect(
                    result[Symbol.for('zenfuse.originalPayload')],
                ).toMatchObject(mockedMarkets);
            }
        });

        it('should return valid schema', () => {
            const schema = {
                type: 'array',
                items: {
                    type: 'string',
                },
            };
            expect(result).toMatchSchema(schema);
        });
    });

    describe('fetchPrice()', () => {
        let result;

        let mockFilePath;
        let mockedPrices;

        const mockedResponce = {
            success: true,
            result: {
                name: 'BTC/USDT',
                enabled: true,
                postOnly: false,
                priceIncrement: 1.0,
                sizeIncrement: 0.0001,
                minProvideSize: 0.0001,
                last: 41577.0,
                bid: 41573.0,
                ask: 41575.0,
                price: 41575.0,
                type: 'spot',
                baseCurrency: 'BTC',
                quoteCurrency: 'USDT',
                underlying: null,
                restricted: false,
                highLeverageFeeExempt: true,
                change1h: 0.00009622092323975848,
                change24h: 0.0012764317711092914,
                changeBod: -0.0002885517108711857,
                quoteVolume24h: 116192699.7696,
                volumeUsd24h: 116191540.1664563,
            },
        };

        let scope = { done() {} };

        if (isIntegrationTest) {
            mockFilePath = __dirname + '/mocks/static/markets.json';
            mockedPrices = JSON.parse(readFileSync(mockFilePath, 'utf-8'));
            scope = nock(HOSTNAME)
                .get('/api/markets')
                .replyWithFile(200, mockFilePath, {
                    'Content-Type': 'application/json',
                })
                .get('/api/markets/BTC/USDT')
                .reply(200, mockedResponce);
        }

        afterAll(() => {
            if (isTestSuiteFailed) return;
            scope.done();
        });

        it('should be defined', () => {
            expect(ftx.fetchPrice).toBeDefined();
        });

        it('should fetch all prices without errors', async () => {
            result = await ftx.fetchPrice();
        });

        it('should have valid originalRespone', () => {
            if (isEnd2EndTest) {
                expect(
                    result[Symbol.for('zenfuse.originalPayload')],
                ).toBeDefined();
            }

            if (isIntegrationTest) {
                expect(
                    result[Symbol.for('zenfuse.originalPayload')],
                ).toStrictEqual(mockedPrices);
            }
        });

        it('should fetch specific price without errors', async () => {
            result = await ftx.fetchPrice('BTC/USDT');
        });

        it('should have valid originalResponse', () => {
            if (isEnd2EndTest) {
                expect(
                    result[Symbol.for('zenfuse.originalPayload')],
                ).toBeInstanceOf(Object);
            }

            if (isIntegrationTest) {
                expect(result[Symbol.for('zenfuse.originalPayload')]).toEqual(
                    mockedResponce,
                );
            }
        });
    });

    ///////////////////////////////////////////////////////////////

    //// Private API Zone

    ///////////////////////////////////////////////////////////////

    describe.only('auth()', () => {
        it('should bo defined', () => {
            expect(ftx.auth).toBeDefined();
        });

        it('should pass keys to instance', () => {
            const keys = {
                publicKey: API_PUBLIC_KEY,
                privateKey: API_SECRET_KEY,
            };

            expect(ftx.hasKeys).toBe(false);

            ftx.auth(keys);

            expect(ftx.hasKeys).toBe(true);
        });
    });

    describe('createOrder()', () => {
        it('should be defined', () => {
            expect(ftx.createOrder).toBeDefined();
        });

        const orderSchema = {
            type: 'object',
            properties: {
                id: {
                    type: 'string',
                },
                timestamp: {
                    type: 'number',
                },
                status: {
                    type: 'string',
                    tags: ['open', 'close', 'canceled'],
                },
                symbol: {
                    type: 'string',
                },
                type: {
                    type: 'string',
                    tags: ['market', 'limit'],
                },
                side: {
                    type: 'string',
                    tags: ['buy', 'sell'],
                },
                price: {
                    type: ['number', 'string'],
                },
                quantity: {
                    type: ['number', 'string'],
                },
            },
            additionalProperties: false,
            minProperties: 8,
        };

        describe('buy by market', () => {
            let result;

            const orderParams = {
                symbol: 'BTC/USDT',
                type: 'market',
                side: 'buy',
                quantity: 0.0004,
            };

            const bodyExpectation = {
                market: 'BTC/USDT',
                side: 'buy',
                type: 'market',
                price: null,
                size: 0.0004,
            };

            const mockedCreatedOrder = {
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
            };

            const scope = nock(HOSTNAME)
                .matchHeader('FTX-KEY', API_PUBLIC_KEY)
                .matchHeader('FTX-TS', expect)
                .matchHeader('FTX-SIGN', expect)
                .post('/api/orders', bodyExpectation)
                .reply(201, mockedCreatedOrder);

            afterAll(() => {
                if (isTestSuiteFailed) return;
                scope.done();
            });

            it('should create order without errors', async () => {
                result = await ftx.createOrder(orderParams);
            });

            it('should have valid originalResponse', () => {
                expect(result).toBeDefined();
                expect(result).toMatchSchema(orderSchema);

                if (isEnd2EndTest) {
                    expect(
                        result[Symbol.for('zenfuse.originalPayload')],
                    ).toBeInstanceOf(Object);
                }

                if (isIntegrationTest) {
                    expect(
                        result[Symbol.for('zenfuse.originalPayload')],
                    ).toEqual(mockedCreatedOrder);
                }
            });
        });

        describe('sell by market', () => {
            let result;

            const orderParams = {
                symbol: 'BTC/USDT',
                type: 'market',
                side: 'sell',
                quantity: 0.0004,
            };

            const bodyExpectation = {
                market: 'BTC/USDT',
                side: 'sell',
                type: 'market',
                price: null,
                size: 0.0004,
            };

            const mockedCreatedOrder = {
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
            };

            const scope = nock(HOSTNAME)
                .matchHeader('FTX-KEY', API_PUBLIC_KEY)
                .matchHeader('FTX-TS', expect)
                .matchHeader('FTX-SIGN', expect)
                .post('/api/orders', bodyExpectation)
                .reply(201, mockedCreatedOrder);

            afterAll(() => {
                if (isTestSuiteFailed) return;
                scope.done();
            });

            it('should create order without errors', async () => {
                result = await ftx.createOrder(orderParams);
            });

            it('should have valid originalResponse', () => {
                expect(result).toBeDefined();

                if (isEnd2EndTest) {
                    expect(
                        result[Symbol.for('zenfuse.originalPayload')],
                    ).toBeInstanceOf(Object);
                }

                if (isIntegrationTest) {
                    expect(
                        result[Symbol.for('zenfuse.originalPayload')],
                    ).toEqual(mockedCreatedOrder);
                }
            });
        });

        describe('buy by limit', () => {
            let result;

            const orderParams = {
                symbol: 'BTC/USDT',
                type: 'limit',
                side: 'buy',
                quantity: 0.0004,
                price: 35000,
            };

            const bodyExpectation = {
                market: 'BTC/USDT',
                type: 'limit',
                side: 'buy',
                size: 0.0004,
                price: 35000,
            };

            const mockedCreatedOrder = {
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
            };

            const scope = nock(HOSTNAME)
                .matchHeader('FTX-KEY', API_PUBLIC_KEY)
                .matchHeader('FTX-TS', expect)
                .matchHeader('FTX-SIGN', expect)
                .post('/api/orders', bodyExpectation)
                .reply(201, mockedCreatedOrder);

            afterAll(() => {
                if (isTestSuiteFailed) return;
                scope.done();
            });

            it('should create order without errors', async () => {
                result = await ftx.createOrder(orderParams);
            });

            it('should have valid originalResponse', () => {
                expect(result).toBeDefined();

                if (isEnd2EndTest) {
                    expect(
                        result[Symbol.for('zenfuse.originalPayload')],
                    ).toBeInstanceOf(Object);
                }

                if (isIntegrationTest) {
                    expect(
                        result[Symbol.for('zenfuse.originalPayload')],
                    ).toMatchObject(mockedCreatedOrder);
                }
            });
        });

        describe('sell by limit', () => {
            let result;

            const orderParams = {
                symbol: 'BTC/USDT',
                type: 'limit',
                side: 'sell',
                quantity: 0.0004,
                price: 55000,
            };

            const bodyExpectation = {
                market: 'BTC/USDT',
                type: 'limit',
                side: 'sell',
                size: 0.0004,
                price: 55000,
            };

            const mockedCreatedOrder = {
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
            };

            const scope = nock(HOSTNAME)
                .matchHeader('FTX-KEY', API_PUBLIC_KEY)
                .matchHeader('FTX-TS', expect)
                .matchHeader('FTX-SIGN', expect)
                .post('/api/orders', bodyExpectation)
                .reply(201, mockedCreatedOrder);

            afterAll(() => {
                if (isTestSuiteFailed) return;
                scope.done();
            });

            it('should create order without errors', async () => {
                result = await ftx.createOrder(orderParams);
            });

            it('should have valid originalResponse', () => {
                expect(result).toBeDefined();

                if (isEnd2EndTest) {
                    expect(
                        result[Symbol.for('zenfuse.originalPayload')],
                    ).toBeInstanceOf(Object);
                }

                if (isIntegrationTest) {
                    expect(
                        result[Symbol.for('zenfuse.originalPayload')],
                    ).toMatchObject(mockedCreatedOrder);
                }
            });
        });
    });

    describe('fetchBalances()', () => {
        it('should be defined', () => {
            expect(ftx.fetchBalances).toBeDefined();
        });

        let result;

        const mockedBalances = {
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
        };

        const scope = nock(HOSTNAME)
            .matchHeader('FTX-KEY', API_PUBLIC_KEY)
            .matchHeader('FTX-SIGN', expect)
            .matchHeader('FTX-TS', expect)
            .get('/api/wallet/balances')
            .reply(200, mockedBalances);

        afterAll(() => {
            if (isTestSuiteFailed) return;
            scope.done();
        });

        it('should fetch without errors', async () => {
            result = await ftx.fetchBalances();
        });

        it('should have valid originalResponse', () => {
            if (isEnd2EndTest) {
                expect(
                    result[Symbol.for('zenfuse.originalPayload')],
                ).toBeInstanceOf(Object);
            }

            if (isIntegrationTest) {
                expect(
                    result[Symbol.for('zenfuse.originalPayload')],
                ).toMatchObject(mockedBalances);
            }
        });
    });

    describe.skip('cancelOrder()', () => {
        let result;

        const binanceDeleteExpectation = {
            symbol: 'BUSDUSDT',
            orderId: '5123847',
        };

        const mockedOrder = {
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
        };

        const scope = nock(HOSTNAME)
            .matchHeader('X-MBX-APIKEY', API_PUBLIC_KEY)
            // Order creation
            .get('/api/v3/openOrders')
            .query((q) => {
                expect(q.timestamp).toBeDefined();
                expect(q.signature).toBeDefined();
                return true;
            })
            .reply(200, [mockedOrder])
            // Order deletion
            .delete('/api/v3/order')
            .query((q) => {
                expect(q).toMatchObject(binanceDeleteExpectation);
                return true;
            })
            .reply(200, mockedOrder);

        afterAll(() => {
            if (isTestSuiteFailed) return;
            scope.done();
        });

        it('shoud cancel order without errors', async () => {
            const orderParams = {
                symbol: 'BUSD/USDT',
                type: 'limit',
                side: 'buy',
                amount: '20',
                price: '0.5',
            };

            let createdOrder = mockedOrder;

            if (isEnd2EndTest) {
                const newOrder = await ftx.createOrder(orderParams);
                createdOrder = newOrder.createdOrder;
            }

            result = await ftx.cancelOrder({ id: createdOrder.orderId });

            expect(result).toBeDefined();
        });

        it('should have valid originalResponse', () => {
            if (isEnd2EndTest) {
                expect(
                    result[Symbol.for('zenfuse.originalPayload')],
                ).toBeInstanceOf(Object);
            }

            if (isIntegrationTest) {
                expect(
                    result[Symbol.for('zenfuse.originalPayload')],
                ).toMatchObject(mockedOrder);
            }
        });
    });
});

///////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////   FTX WEBSOCKET INTERFACE   /////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////

const MOCKED_LISTEN_KEY = {
    listenKey: 'hellositwhenairdropwhenftx',
};

/**
 * @typedef {import('../../src/exchanges/ftx/streams/accountDataStream.js')} AccountDataStream
 */

// TODO: Make test for FTX
describe.skip('Ftx Spot Wallet Private Stream', () => {
    if (isIntegrationTest) {
        // TODO: Mock websocket
        // console.warn('Websoket test skipped');
        return;
    }

    /**
     * @type {AccountDataStream}
     */
    let accountDataStream;

    /**
     * @type {BinanceSpot}
     */
    let binance;

    beforeAll(() => {
        binance = new FTX['spot']().auth({
            publicKey: API_PUBLIC_KEY,
            privateKey: API_SECRET_KEY,
        });

        accountDataStream = binance.getAccountDataStream();
    });

    afterAll(() => {
        expect(accountDataStream.isSocketConneted).toBe(false);
    });

    describe('open()', () => {
        const scope = nock(HOSTNAME)
            .matchHeader('X-MBX-APIKEY', API_PUBLIC_KEY)
            .post('/api/v3/userDataStream')
            .query((query) => {
                expect(query).toHaveLength(0);
                return true;
            })
            .reply(200, MOCKED_LISTEN_KEY);

        // TODO: Mock websocket

        afterAll(() => {
            if (isTestSuiteFailed) return;
            scope.done();
        });

        it('should connect to websocket', async () => {
            await accountDataStream.open();

            expect(accountDataStream.isSocketConneted).toBe(true);
        });

        it.skip('should emit events on order creation', async () => {
            const orderParams = {
                symbol: 'BUSD/USDT',
                type: 'limit',
                side: 'buy',
                amount: '20',
                price: '0.5',
            };

            const orderUpdatePromice = new Promise((resolve) => {
                accountDataStream.once('orderUpdate', resolve);
            });

            const tickersChangedPromice = new Promise((resolve) => {
                accountDataStream.once('tickersChanged', resolve);
            });

            const { createdOrder } = await binance.createOrder(orderParams);

            return await Promise.all([
                orderUpdatePromice,
                tickersChangedPromice,
            ]).then(() => {
                createdOrder.id = createdOrder.orderId;
                return binance.cancelOrder(createdOrder);
            });
        });
    });

    describe('close()', () => {
        it('should close connection', () => {
            expect(accountDataStream.isSocketConneted).toBe(true);

            accountDataStream.close();

            expect(accountDataStream.isSocketConneted).toBe(false);
        });
    });
});

/**
 * @typedef {import('../../src/exchanges/ftx/streams/marketDataStream.js')} MarketDataStream
 */

// TODO: Make test for FTX
describe.skip('Ftx Spot Wallet Public Stream', () => {
    if (isIntegrationTest) {
        // TODO: Mock websocket
        // console.warn('Websoket test skipped');
        return;
    }

    /**
     * @type {MarketDataStream}
     */
    let marketDataStream;

    /**
     * @type {BinanceSpot}
     */
    let ftx;

    beforeAll(() => {
        ftx = new FTX['spot']();

        marketDataStream = ftx.getMarketDataStream();
    });

    afterAll(() => {
        marketDataStream.close();
    });

    describe('open()', () => {
        it('should connect to websocket', async () => {
            await marketDataStream.open();

            expect(marketDataStream.isSocketConneted).toBe(true);
        });
    });

    describe('subscribeTo()', () => {
        beforeEach(async () => {
            marketDataStream.close();
            await marketDataStream.open();
            expect(marketDataStream.isSocketConneted).toBe(true);
        });

        afterEach(() => {
            marketDataStream.close();
        });

        it('should new on new candles', (done) => {
            marketDataStream.subscribeTo({
                channel: 'kline',
                symbol: 'BTC/USDT',
                interval: '15m',
            });

            marketDataStream.once('kline', (kline) => {
                expect(kline).toBeInstanceOf(Object);
                // kline must be up to date for the last minute
                expect(kline.timestamp).toBeCloseTo(Date.now(), -7);
                done();
            });
        });
        it('should watch on new candles from symbols', (done) => {
            marketDataStream.subscribeTo('BTC/USDT');

            marketDataStream.once('kline', (kline) => {
                expect(kline).toBeInstanceOf(Object);
                expect(kline.symbol).toBe('BTCUSDT'); // TODO: Add symbol transformation
                // kline must be up to date for the last minute
                expect(kline.timestamp).toBeCloseTo(Date.now(), -7);
                done();
            });
        });
    });

    describe('unsubscribeFrom()', () => {
        beforeEach(async () => {
            await marketDataStream.open();
            expect(marketDataStream.isSocketConneted).toBe(true);
        });

        afterEach(() => {
            marketDataStream.close();
        });

        afterAll(async () => {
            await marketDataStream.open();
        });

        it('should unsubsctibed from specific event', async () => {
            expect(marketDataStream.isSocketConneted).toBe(true);

            await marketDataStream.subscribeTo({
                channel: 'kline',
                symbol: 'BTC/USDT',
                interval: '15m',
            });

            await marketDataStream.unsubscribeFrom({
                channel: 'kline',
                symbol: 'BTC/USDT',
                interval: '15m',
            });

            const listener = jest.fn();

            marketDataStream.once('kline', listener);

            return await new Promise((resolve) => {
                setTimeout(() => {
                    expect(listener).not.toHaveBeenCalled();
                    resolve();
                }, 3000);
            });
        });

        it('should unsubscribe by string', async () => {
            expect(marketDataStream.isSocketConneted).toBe(true);

            await marketDataStream.subscribeTo('BTC/USDT');

            await marketDataStream.unsubscribeFrom('BTC/USDT');

            const listener = jest.fn();

            marketDataStream.once('kline', listener);

            return new Promise((resolve) => {
                setTimeout(() => {
                    expect(listener).not.toHaveBeenCalled();
                    resolve();
                });
                global.testTimeout * 0.3;
            });
        });

        it('should unsubscribe by string from all events with the same symbol', async () => {
            expect(marketDataStream.isSocketConneted).toBe(true);

            await marketDataStream.subscribeTo({
                channel: 'kline',
                symbol: 'BTC/USDT',
                interval: '15m',
            });

            await marketDataStream.subscribeTo({
                channel: 'kline',
                symbol: 'BTC/USDT',
                interval: '1h',
            });

            await marketDataStream.subscribeTo({
                channel: 'kline',
                symbol: 'BNB/BUSD',
                interval: '1m',
            });

            await marketDataStream.unsubscribeFrom('BTC/USDT');

            const listener = jest.fn();

            marketDataStream.once('kline', listener);

            return new Promise((resolve) => {
                setTimeout(() => {
                    expect(listener).toHaveBeenCalled();
                    listener.mock.calls.forEach((call) => {
                        const kline = call[0];

                        expect(kline.symbol).toBe('BNBBUSD');
                        expect(kline.interval).toBe('1m');
                    });
                    resolve();
                }, global.testTimeout * 0.3);
            });
        });
    });

    describe('close()', () => {
        it('should close connection', () => {
            expect(marketDataStream.isSocketConneted).toBe(true);

            marketDataStream.close();

            expect(marketDataStream.isSocketConneted).toBe(false);
        });
    });
});
