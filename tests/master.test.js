// TODO: Delete this
const { readFileSync } = require('fs');
const nock = require('nock');
const HOSTNAME = 'https://ftx.com';
// TODO: Delete this

module.exports = function masterTest(Exchange, httpScope, env) {
    this.httpScope = httpScope;

    /**
     * @typedef {import('../src/exchanges/ftx/wallets/spot.js')} FtxSpot
     */

    // TODO: Make test for FTX
    describe.skip('Options usage', () => {
        /**
         * @type {FtxSpot}
         */
        let ftx;

        describe('useCache', () => {
            it('should use cache by default', async () => {
                const mockFilePath =
                    __dirname + '/exchanges/ftx/mocks/static/markets.json';
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
    //////////////////////////////////////  HTTP INTERFACE  ///////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////

    describe('Spot Wallet HTTP interface', () => {
        /**
         * @type {FtxSpot}
         */
        let exchange;

        beforeAll(() => {
            exchange = new Exchange['spot']();
        });

        describe('ping()', () => {
            it('should be defined', () => {
                expect(exchange.ping).toBeDefined();
            });
            it('should pings :)', async () => {
                await exchange.ping();
            });
        });

        describe('fetchMarkets()', () => {
            let result;

            it('should be defined', () => {
                expect(exchange.fetchMarkets).toBeDefined();
            });

            it('should fetch without errors', async () => {
                result = await exchange.fetchMarkets();
            });

            it('should have valid originalResponse', () => {
                expect(
                    result[Symbol.for('zenfuse.originalPayload')],
                ).toBeDefined();
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

            it('should be defined', () => {
                expect(exchange.fetchTickers).toBeDefined();
            });

            it('should fetch without errors', async () => {
                result = await exchange.fetchTickers();
            });

            it('should have valid originalResponse', () => {
                expect(
                    result[Symbol.for('zenfuse.originalPayload')],
                ).toBeDefined();
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

            it('should be defined', () => {
                expect(exchange.fetchPrice).toBeDefined();
            });

            it('should fetch all prices without errors', async () => {
                result = await exchange.fetchPrice();
            });

            it('should have valid originalRespone', () => {
                expect(
                    result[Symbol.for('zenfuse.originalPayload')],
                ).toBeDefined();
            });

            it('should fetch specific price without errors', async () => {
                result = await exchange.fetchPrice('BTC/USDT');
            });

            it('should have valid originalResponse', () => {
                expect(
                    result[Symbol.for('zenfuse.originalPayload')],
                ).toBeDefined();
            });
        });

        ///////////////////////////////////////////////////////////////

        //// Private API Zone

        ///////////////////////////////////////////////////////////////

        describe('auth()', () => {
            it('should bo defined', () => {
                expect(exchange.auth).toBeDefined();
            });

            it('should pass keys to instance', () => {
                const keys = {
                    publicKey: env.API_PUBLIC_KEY,
                    privateKey: env.API_SECRET_KEY,
                };

                expect(exchange.hasKeys).toBe(false);

                exchange.auth(keys);

                expect(exchange.hasKeys).toBe(true);
            });
        });

        describe('createOrder()', () => {
            it('should be defined', () => {
                expect(exchange.createOrder).toBeDefined();
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

                it('should create order without errors', async () => {
                    result = await exchange.createOrder(orderParams);
                });

                it('should have valid originalResponse', () => {
                    expect(result).toBeDefined();
                    expect(result).toMatchSchema(orderSchema);

                    expect(
                        result[Symbol.for('zenfuse.originalPayload')],
                    ).toBeDefined();
                });
            });

            describe.skip('sell by market', () => {
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
                    .matchHeader('FTX-KEY', env.API_PUBLIC_KEY)
                    .matchHeader('FTX-TS', expect)
                    .matchHeader('FTX-SIGN', expect)
                    .post('/api/orders', bodyExpectation)
                    .reply(201, mockedCreatedOrder);

                afterAll(() => {
                    if (isTestSuiteFailed) return;
                    scope.done();
                });

                it('should create order without errors', async () => {
                    result = await exchange.createOrder(orderParams);
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

            describe.skip('buy by limit', () => {
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
                    .matchHeader('FTX-KEY', env.API_PUBLIC_KEY)
                    .matchHeader('FTX-TS', expect)
                    .matchHeader('FTX-SIGN', expect)
                    .post('/api/orders', bodyExpectation)
                    .reply(201, mockedCreatedOrder);

                afterAll(() => {
                    if (isTestSuiteFailed) return;
                    scope.done();
                });

                it('should create order without errors', async () => {
                    result = await exchange.createOrder(orderParams);
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

            describe.skip('sell by limit', () => {
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
                    .matchHeader('FTX-KEY', env.API_PUBLIC_KEY)
                    .matchHeader('FTX-TS', expect)
                    .matchHeader('FTX-SIGN', expect)
                    .post('/api/orders', bodyExpectation)
                    .reply(201, mockedCreatedOrder);

                afterAll(() => {
                    if (isTestSuiteFailed) return;
                    scope.done();
                });

                it('should create order without errors', async () => {
                    result = await exchange.createOrder(orderParams);
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

        describe.skip('fetchBalances()', () => {
            it('should be defined', () => {
                expect(exchange.fetchBalances).toBeDefined();
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
                .matchHeader('FTX-KEY', env.API_PUBLIC_KEY)
                .matchHeader('FTX-SIGN', expect)
                .matchHeader('FTX-TS', expect)
                .get('/api/wallet/balances')
                .reply(200, mockedBalances);

            afterAll(() => {
                if (isTestSuiteFailed) return;
                scope.done();
            });

            it('should fetch without errors', async () => {
                result = await exchange.fetchBalances();
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

            const mockedOrder = {
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
            };

            const scope = nock(HOSTNAME)
                .matchHeader('FTX-KEY', env.API_PUBLIC_KEY)
                .matchHeader('FTX-TS', expect)
                .matchHeader('FTX-SIGN', expect)
                // // Order creation
                // .post('/api/orders')
                // .reply(200, mockedOrder)
                // Order deletion
                .delete(`/api/orders/112590877630`)
                .reply(200);

            afterAll(() => {
                if (isTestSuiteFailed) return;
                scope.done();
            });

            it('shoud cancel order without errors', async () => {
                const orderParams = {
                    symbol: 'USDT/USD',
                    type: 'limit',
                    side: 'buy',
                    quantity: '20',
                    price: '0.5',
                };

                let createdOrder = mockedOrder.result;

                if (isEnd2EndTest) {
                    const newOrder = await exchange.createOrder(orderParams);
                    createdOrder = newOrder;
                }

                result = await exchange.cancelOrder(createdOrder);

                expect(result).toBeDefined();
            });

            it('should have valid originalResponse', () => {
                if (isEnd2EndTest) {
                    expect(
                        result[Symbol.for('zenfuse.originalPayload')],
                    ).toBeInstanceOf(Object);
                }

                if (isIntegrationTest) {
                    expect(result[Symbol.for('zenfuse.originalPayload')]).toBe(
                        '',
                    );
                }
            });
        });
    });

    ///////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////  WEBSOCKET INTERFACE  ////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * @typedef {import('../../../src/exchanges/ftx/streams/accountDataStream.js')} AccountDataStream
     */

    describe.skip('Spot Wallet Private Stream', () => {
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
         * @type {FtxSpot}
         */
        let ftx;

        beforeAll(() => {
            ftx = new FTX['spot']().auth({
                publicKey: env.API_PUBLIC_KEY,
                privateKey: env.API_SECRET_KEY,
            });

            accountDataStream = ftx.getAccountDataStream();
        });

        afterAll(() => {
            if (isTestSuiteFailed) {
                accountDataStream.close();
            }
            expect(accountDataStream.isSocketConneted).toBe(false);
        });

        describe('open()', () => {
            // TODO: Mock websocket

            afterAll(() => {
                if (isTestSuiteFailed) return;
            });

            it('should connect to websocket', async () => {
                await accountDataStream.open();

                expect(accountDataStream.isSocketConneted).toBe(true);
            });

            it('should emit "orderUpdate"', async () => {
                const orderParams = {
                    symbol: 'USDT/USD',
                    type: 'limit',
                    side: 'buy',
                    quantity: '20',
                    price: '0.5',
                };

                const orderUpdatePromice = new Promise((resolve) => {
                    accountDataStream.once('orderUpdate', resolve);
                });

                const createdOrder = await ftx.createOrder(orderParams);

                return await orderUpdatePromice.then(() =>
                    ftx.cancelOrder(createdOrder),
                );
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
     * @typedef {import('../../../src/exchanges/ftx/streams/marketDataStream.js')} MarketDataStream
     */

    describe.skip('Spot Wallet Public Stream', () => {
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
         * @type {FtxSpot}
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

            it('should subscribe for price', (done) => {
                marketDataStream.subscribeTo({
                    channel: 'price',
                    symbol: 'BTC/USD',
                });

                marketDataStream.once('newPrice', ({ symbol, price }) => {
                    expect(symbol).toBe('BTC/USD');
                    expect(typeof price).toBe('number');
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
                    channel: 'price',
                    symbol: 'BTC/USD',
                });

                await marketDataStream.unsubscribeFrom({
                    channel: 'price',
                    symbol: 'BTC/USD',
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

            // TODO: FTX Websocket subscription list memory
            // Should be skipped for now, FTX websocket doesnt have "get subscription" support
            it.skip('should unsubscribe by string', async () => {
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

            it.skip('should unsubscribe by string from all events with the same symbol', async () => {
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
};
