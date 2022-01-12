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
                expect(result).toBeDefined();
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
                expect(result).toBeDefined();
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
                expect(result).toBeDefined();
                expect(
                    result[Symbol.for('zenfuse.originalPayload')],
                ).toBeDefined();
            });

            it('should fetch specific price without errors', async () => {
                result = await exchange.fetchPrice('BTC/USDT');
            });

            it('should have valid originalResponse', () => {
                expect(result).toBeDefined();
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

                it('should create order without errors', async () => {
                    result = await exchange.createOrder({
                        symbol: 'BTC/USDT',
                        type: 'market',
                        side: 'buy',
                        quantity: 0.0004,
                    });
                });

                it('should have valid originalResponse', () => {
                    expect(result).toBeDefined();
                    expect(result).toMatchSchema(orderSchema);

                    expect(
                        result[Symbol.for('zenfuse.originalPayload')],
                    ).toBeDefined();
                });
            });

            describe('sell by market', () => {
                let result;

                it('should create order without errors', async () => {
                    result = await exchange.createOrder({
                        symbol: 'BTC/USDT',
                        type: 'market',
                        side: 'sell',
                        quantity: 0.0004,
                    });
                });

                it('should have valid originalResponse', () => {
                    expect(result).toBeDefined();
                    expect(result).toMatchSchema(orderSchema);
                    expect(
                        result[Symbol.for('zenfuse.originalPayload')],
                    ).toBeDefined();
                });
            });

            describe('buy by limit', () => {
                let result;

                it('should create order without errors', async () => {
                    result = await exchange.createOrder({
                        symbol: 'BTC/USDT',
                        type: 'limit',
                        side: 'buy',
                        quantity: 0.0004,
                        price: 35000,
                    });
                });

                it('should have valid originalResponse', () => {
                    expect(result).toBeDefined();
                    expect(result).toMatchSchema(orderSchema);

                    expect(
                        result[Symbol.for('zenfuse.originalPayload')],
                    ).toBeDefined();
                });
            });

            describe('sell by limit', () => {
                let result;

                it('should create order without errors', async () => {
                    result = await exchange.createOrder({
                        symbol: 'BTC/USDT',
                        type: 'limit',
                        side: 'sell',
                        quantity: 0.0004,
                        price: 55000,
                    });
                });

                it('should have valid originalResponse', () => {
                    expect(result).toBeDefined();
                    expect(result).toMatchSchema(orderSchema);

                    expect(
                        result[Symbol.for('zenfuse.originalPayload')],
                    ).toBeDefined();
                });
            });
        });

        describe('fetchBalances()', () => {
            it('should be defined', () => {
                expect(exchange.fetchBalances).toBeDefined();
            });

            let result;

            it('should fetch without errors', async () => {
                result = await exchange.fetchBalances();
                
            });

            it('should have valid originalResponse', () => {
                expect(result).toBeDefined();
                // TODO: Test output
                expect(
                    result[Symbol.for('zenfuse.originalPayload')],
                ).toBeDefined();
            });
        });

        describe('cancelOrder()', () => {
            let result;

            it('shoud cancel order without errors', async () => {
                const createdOrder = await exchange.createOrder({
                    symbol: 'USDT/USD',
                    type: 'limit',
                    side: 'buy',
                    quantity: '20',
                    price: '0.5',
                });

                result = await exchange.cancelOrder(createdOrder);
            });

            it('should have valid originalResponse', () => {
                expect(result).toBeDefined();
                expect(
                    result[Symbol.for('zenfuse.originalPayload')],
                ).toBeDefined();
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
