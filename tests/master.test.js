const { z } = require('zod');

/**
 * @typedef {object} MasterTestEnvironment
 * @property {string} API_PUBLIC_KEY
 * @property {string} API_PRIVATE_KEY
 * @property {import('../src/index.js').Order} NOT_EXECUTABLE_ORDER An order that will never be executed. Usualy a pair of stablecoins for less than one.
 */

const NotAuthenticatedError = require('../src/base/errors/notAuthenticated.error.js');
const OrderSchema = require('../src/base/schemas/openOrder');
const KlineSchema = require('../src/base/schemas/kline');

/**
 * @param {object} Exchange
 * @param {MasterTestEnvironment} env
 */
module.exports = function masterTest(Exchange, env) {
    /**
     * @typedef {import('../src/exchanges/ftx/wallets/spot.js')} FtxSpot
     */

    // TODO: Options usage tests

    ///////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////  HTTP INTERFACE  ///////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////

    describe('Spot Wallet HTTP interface', () => {
        /**
         * @type {FtxSpot}
         */
        let exchange = new Exchange['spot']();

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

            it('should return valid output', () => {
                const schema = z.array(
                    z.object({
                        symbol: z.string(),
                        baseTicker: z.string(),
                        quoteTicker: z.string(),
                    }),
                );
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
                const schema = z.array(z.string());
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

            it('should return valid schema', () => {
                const schema = z.array(
                    z.object({
                        symbol: z
                            .string()
                            .refine((s) => s.split('/').length === 2),
                        price: z.number(),
                    }),
                );
                expect(result).toMatchSchema(schema);
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

        describe.only('fetchCandleHistory()', () => {
            let result;

            it('should be defined', () => {
                expect(exchange.fetchCandleHistory).toBeDefined();
            });

            it('should fetch history without errors', async () => {
                result = await exchange.fetchCandleHistory({
                    symbol: 'BTC/USDT',
                    interval: '1m',
                });
            });

            it('should return valid schema', () => {
                const schema = z.array(KlineSchema);
                expect(result).toMatchSchema(schema);
            });

            it('should have valid originalRespone', () => {
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
                    privateKey: env.API_PRIVATE_KEY,
                };

                expect(exchange.hasKeys).toBe(false);

                exchange.auth(keys);

                expect(exchange.hasKeys).toBe(true);
            });
        });

        // NOTE: Now exchange is authenticated instance

        describe('createOrder()', () => {
            it('should be defined', () => {
                expect(exchange.createOrder).toBeDefined();
            });

            it('should run only with keys', () => {
                expect(
                    exchange.createOrder.bind(
                        new Exchange['spot'](),
                        env.NOT_EXECUTABLE_ORDER,
                    ),
                ).rejects.toThrowError(NotAuthenticatedError);
            });

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
                    // TODO: Fix output validation
                    expect(result).toMatchSchema(OrderSchema);

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
                    expect(result).toMatchSchema(OrderSchema);
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
                    expect(result).toMatchSchema(OrderSchema);

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
                    expect(result).toMatchSchema(OrderSchema);

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

            it('should run only with keys', () => {
                expect(
                    exchange.fetchBalances.bind(new Exchange['spot']()),
                ).rejects.toThrowError(NotAuthenticatedError);
            });

            let result;

            it('should fetch without errors', async () => {
                result = await exchange.fetchBalances();
            });

            it('should return valid schema', () => {
                const schema = z.array(
                    z
                        .object({
                            ticker: z.string(),
                            free: z.number(),
                            used: z.number(),
                        })
                        .refine((b) => b.free > 0 || b.used > 0),
                );
                expect(result).toMatchSchema(schema);
            });

            it('should have valid originalResponse', () => {
                expect(result).toBeDefined();
                // TODO: Test output
                expect(
                    result[Symbol.for('zenfuse.originalPayload')],
                ).toBeDefined();
            });
        });

        describe('cancelOrderById()', () => {
            it('should be defined', () => {
                expect(exchange.cancelOrderById).toBeDefined();
            });

            it('should run only with keys', () => {
                expect(
                    exchange.cancelOrderById.bind(
                        new Exchange['spot'](),
                        '7787',
                    ),
                ).rejects.toThrowError(NotAuthenticatedError);
            });

            let result;

            it('should cancel order without errors', async () => {
                const createdOrder = await exchange.createOrder(
                    env.NOT_EXECUTABLE_ORDER,
                );

                result = await exchange.cancelOrderById(createdOrder.id);
            });

            it('should have valid originalResponse', () => {
                expect(result).toBeDefined();
                expect(
                    result[Symbol.for('zenfuse.originalPayload')],
                ).toBeDefined();
            });
        });

        describe('fetchOrderById()', () => {
            let result;
            let createdOrder;

            it('should run only with keys', () => {
                expect(
                    exchange.cancelOrderById.bind(new Exchange['spot'](), ''),
                ).rejects.toThrowError(NotAuthenticatedError);
            });

            afterAll(() => {
                exchange.cancelOrderById(createdOrder.id);
            });

            it('should be defined', () => {
                expect(exchange.fetchOrderById).toBeDefined();
            });

            it('should fetch without errors', async () => {
                createdOrder = await exchange.createOrder(
                    env.NOT_EXECUTABLE_ORDER,
                );

                result = await exchange.fetchOrderById(createdOrder.id);
            });

            it('should return exact order', () => {
                expect(createdOrder).toBeDefined();
                expect(result).toBeDefined();

                expect(result).toEqual(createdOrder);
            });

            it('should return valid schema', () => {
                expect(result).toMatchSchema(OrderSchema);
                expect(createdOrder).toMatchSchema(OrderSchema);
            });
        });
    });

    ///////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////  WEBSOCKET INTERFACE  ////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * @typedef {import('../src/exchanges/ftx/streams/accountDataStream.js')} AccountDataStream
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
        let exchange;

        beforeAll(() => {
            exchange = new Exchange['spot']().auth({
                publicKey: env.API_PUBLIC_KEY,
                privateKey: env.API_PRIVATE_KEY,
            });

            accountDataStream = exchange.getAccountDataStream();
        });

        afterAll(() => {
            if (isExchangeTestFailed) {
                accountDataStream.socket.terminate();
            }
        });

        describe('open()', () => {
            // TODO: Mock websocket
            afterAll(() => {
                accountDataStream.close();
            });

            it('should connect to websocket', async () => {
                await accountDataStream.open();

                expect(accountDataStream.isSocketConneted).toBe(true);
            });

            it('should emit "orderUpdate"', async () => {
                const eventPromice = new Promise((resolve) => {
                    accountDataStream.once('orderUpdate', (order) => {
                        expect(order).toMatchSchema(OrderSchema);
                        expect(order.id).toBe(createdOrder.id);
                        resolve();
                    });
                });

                const createdOrder = await exchange.createOrder(
                    env.NOT_EXECUTABLE_ORDER,
                );

                return await eventPromice.then(() =>
                    exchange.cancelOrderById(createdOrder.id),
                );
            });
        });

        describe('close()', () => {
            beforeAll(() => accountDataStream.open());
            it('should close connection', () => {
                expect(accountDataStream.isSocketConneted).toBe(true);

                accountDataStream.close();

                expect(accountDataStream.isSocketConneted).toBe(false);
            });
        });
    });

    /**
     * @typedef {import('../src/exchanges/ftx/streams/marketDataStream.js')} MarketDataStream
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
        let exchange;

        beforeAll(() => {
            exchange = new Exchange['spot']();

            marketDataStream = exchange.getMarketDataStream();
            marketDataStream.on('error', (err) => {
                throw err;
            });
        });

        afterEach(() => {
            if (isExchangeTestFailed) {
                marketDataStream.socket.terminate();
            }
        });

        describe('open()', () => {
            it('should connect to websocket', async () => {
                await marketDataStream.open();

                expect(marketDataStream.isSocketConneted).toBe(true);
            });
        });

        describe('subscribeTo()', () => {
            beforeEach(async () => {
                expect(marketDataStream.isSocketConneted).toBe(true);
            });

            it('should emit "newPrice" event', (done) => {
                marketDataStream.subscribeTo({
                    channel: 'price',
                    symbol: 'BTC/USDT',
                });

                marketDataStream.once('newPrice', (p) => {
                    const schema = z.object({
                        symbol: z
                            .string()
                            .refine((s) => s.split('/').length === 2),
                        price: z.number(),
                    });
                    expect(p).toMatchSchema(schema);
                    expect(p.symbol).toBe('BTC/USDT');

                    marketDataStream
                        .unsubscribeFrom({
                            channel: 'price',
                            symbol: 'BTC/USDT',
                        })
                        .then(done);
                });
            });

            it('should emit "candle" event', (done) => {
                marketDataStream.subscribeTo({
                    channel: 'candle',
                    symbol: 'BTC/USDT',
                    interval: '15m',
                });

                marketDataStream.once('candle', (p) => {
                    expect(p).toMatchSchema(KlineSchema);
                    expect(p.symbol).toBe('BTC/USDT');
                    expect(p.interval).toBe('15m');

                    marketDataStream
                        .unsubscribeFrom({
                            channel: 'candle',
                            symbol: 'BTC/USDT',
                            interval: '15m',
                        })
                        .then(done);
                });
            });
        });

        describe('unsubscribeFrom()', () => {
            beforeEach(async () => {
                expect(marketDataStream.isSocketConneted).toBe(true);
            });

            it('should unsubsctibed from specific event', async () => {
                expect(marketDataStream.isSocketConneted).toBe(true);

                await marketDataStream.subscribeTo({
                    channel: 'price',
                    symbol: 'BTC/USDT',
                });

                await marketDataStream.unsubscribeFrom({
                    channel: 'price',
                    symbol: 'BTC/USDt',
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
