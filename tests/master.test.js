const { z } = require('zod');
const zenfuse = require('zenfuse');

const MockedAgent = require('./mocks/agent');

/**
 * @typedef {import('../src/index.js').Order} Order
 * @typedef {import('../src/index.js').timeInterval} timeInterval
 */

/**
 * @typedef {object} MasterTestEnvironment
 * @property {string} API_PUBLIC_KEY
 * @property {string} API_PRIVATE_KEY
 * @property {object} CANDLES_REQUEST
 * @property {string} CANDLES_REQUEST.symbol
 * @property {timeInterval} CANDLES_REQUEST.interval
 * @property {Order} BUY_MARKET_ORDER
 * @property {Order} SELL_MARKET_ORDER
 * @property {Order} BUY_LIMIT_ORDER
 * @property {Order} SELL_LIMIT_ORDER
 * @property {Order} NOT_EXECUTABLE_ORDER An order that will never be executed. Usually a pair of stablecoins for a half price.
 * @property {Order} PRECISION_REQUIRED_ORDER
 * @property {Order} PRECISION_IMPOSSIBLE_ORDER
 * @property {object} PRICE_SUBSCRIPTION
 * @property {string} PRICE_SUBSCRIPTION.channel
 * @property {string} PRICE_SUBSCRIPTION.symbol
 * @property {object} CANDLE_SUBSCRIPTION
 * @property {string} CANDLE_SUBSCRIPTION.channel
 * @property {string} CANDLE_SUBSCRIPTION.symbol
 * @property {timeInterval} CANDLE_SUBSCRIPTION.interval
 */

const UserError = require('../src/base/errors/user.error.js');
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

            it('should have valid originalPayload', () => {
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

        describe('fetchCandleHistory()', () => {
            let result;

            it('should be defined', () => {
                expect(exchange.fetchCandleHistory).toBeDefined();
            });

            it('should fetch history without errors', async () => {
                result = await exchange.fetchCandleHistory(env.CANDLES_REQUEST);
            });

            it('should return valid schema', () => {
                const schema = z.array(KlineSchema);
                expect(result).toMatchSchema(schema);

                result.forEach((kline) => {
                    expect(kline.interval).toBe(env.CANDLES_REQUEST.interval);
                    expect(kline.symbol).toBe(env.CANDLES_REQUEST.symbol);
                    expect(
                        kline[Symbol.for('zenfuse.originalPayload')],
                    ).toBeDefined();
                });
            });

            it('should have valid originalPayload', () => {
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
                    additionalKey: env.API_ADDITIONAL_KEY,
                };

                expect(exchange.hasKeys).toBe(false);

                exchange.auth(keys);

                expect(exchange.hasKeys).toBe(true);
            });
        });

        // NOTE: Now exchange is authenticated instance

        describe('postOrder()', () => {
            it('should be defined', () => {
                expect(exchange.postOrder).toBeDefined();
            });

            it('should run only with keys', () => {
                try {
                    exchange.postOrder.bind(
                        new Exchange['spot'](),
                        env.NOT_EXECUTABLE_ORDER,
                    );
                } catch (e) {
                    expect(e).toBeInstanceOf(UserError);
                    expect(e.code).toBe('NOT_AUTHENTICATED');
                }
            });

            describe('buy by market', () => {
                let result;

                it('should create order without errors', async () => {
                    result = await exchange.postOrder(env.BUY_MARKET_ORDER);
                });

                it('should have valid originalResponse', () => {
                    expect(result).toBeDefined();
                    expect(result).toMatchSchema(OrderSchema);
                    expect(result).toMatchObject({
                        symbol: env.BUY_MARKET_ORDER.symbol,
                        type: env.BUY_MARKET_ORDER.type,
                        side: env.BUY_MARKET_ORDER.side,
                    });

                    expect(
                        result[Symbol.for('zenfuse.originalPayload')],
                    ).toBeDefined();
                });
            });

            describe('sell by market', () => {
                let result;

                it('should create order without errors', async () => {
                    result = await exchange.postOrder(env.SELL_MARKET_ORDER);
                });

                it('should have valid originalResponse', () => {
                    expect(result).toBeDefined();
                    expect(result).toMatchSchema(OrderSchema);
                    expect(result).toMatchObject({
                        symbol: env.SELL_MARKET_ORDER.symbol,
                        type: env.SELL_MARKET_ORDER.type,
                        side: env.SELL_MARKET_ORDER.side,
                    });
                    expect(
                        result[Symbol.for('zenfuse.originalPayload')],
                    ).toBeDefined();
                });
            });

            describe('buy by limit', () => {
                let result;

                it('should create order without errors', async () => {
                    result = await exchange.postOrder(env.BUY_LIMIT_ORDER);
                });

                it('should have valid originalResponse', () => {
                    expect(result).toBeDefined();
                    expect(result).toMatchSchema(OrderSchema);
                    expect(result).toMatchObject({
                        symbol: env.BUY_LIMIT_ORDER.symbol,
                        type: env.BUY_LIMIT_ORDER.type,
                        side: env.BUY_LIMIT_ORDER.side,
                    });
                    expect(
                        result[Symbol.for('zenfuse.originalPayload')],
                    ).toBeDefined();
                });
            });

            describe('sell by limit', () => {
                let result;

                it('should create order without errors', async () => {
                    result = await exchange.postOrder(env.SELL_LIMIT_ORDER);
                });

                it('should have valid originalResponse', () => {
                    expect(result).toBeDefined();
                    expect(result).toMatchSchema(OrderSchema);
                    expect(result).toMatchObject({
                        symbol: env.SELL_LIMIT_ORDER.symbol,
                        type: env.SELL_LIMIT_ORDER.type,
                        side: env.SELL_LIMIT_ORDER.side,
                    });
                    expect(
                        result[Symbol.for('zenfuse.originalPayload')],
                    ).toBeDefined();
                });
            });

            describe('values precision', () => {
                let result;
                it('should precise order value and post it without errors', async () => {
                    result = await exchange.postOrder(
                        env.PRECISION_REQUIRED_ORDER,
                    );
                });

                it('should have valid originalResponse', () => {
                    expect(result).toBeDefined();
                    expect(result).toMatchSchema(OrderSchema);
                    expect(result).toMatchObject({
                        symbol: env.PRECISION_REQUIRED_ORDER.symbol,
                        type: env.PRECISION_REQUIRED_ORDER.type,
                        side: env.PRECISION_REQUIRED_ORDER.side,
                    });
                    expect(
                        result[Symbol.for('zenfuse.originalPayload')],
                    ).toBeDefined();
                });
            });
        });

        describe('fetchOpenOrders()', () => {
            let result;
            let createdOrder;

            it('should run only with keys', () => {
                try {
                    exchange.fetchOpenOrders.bind(
                        new Exchange['spot'](),
                        'super-order-id',
                    );
                } catch (e) {
                    expect(e).toBeInstanceOf(UserError);
                    expect(e.code).toBe('NOT_AUTHENTICATED');
                }
            });

            afterAll(() => {
                if (createdOrder) {
                    exchange.cancelOrderById(createdOrder.id);
                }
            });

            it('should be defined', () => {
                expect(exchange.fetchOpenOrders).toBeDefined();
            });

            it('should fetch without errors', async () => {
                createdOrder = await exchange.createOrder(
                    env.NOT_EXECUTABLE_ORDER,
                );

                result = await exchange.fetchOpenOrders();
            });

            it('should return exact order', () => {
                expect(createdOrder).toBeDefined();
                expect(result).toBeDefined();

                expect(result[0].symbol).toBe(createdOrder.symbol);
                expect(result[0].type).toBe(createdOrder.type);
                expect(result[0].side).toBe(createdOrder.side);
                expect(result[0].quantity).toBe(createdOrder.quantity);
                expect(result[0].price).toBe(createdOrder.price);
                expect(result[0].timestamp).toBeCloseTo(
                    createdOrder.timestamp,
                    -100,
                );
            });

            it('should return valid schema', () => {
                expect(result[0]).toMatchSchema(OrderSchema);
                expect(createdOrder).toMatchSchema(OrderSchema);
            });
        });

        describe('fetchBalances()', () => {
            it('should be defined', () => {
                expect(exchange.fetchBalances).toBeDefined();
            });

            it('should run only with keys', () => {
                try {
                    exchange.fetchBalances.bind(new Exchange['spot']());
                } catch (e) {
                    expect(e).toBeInstanceOf(UserError);
                    expect(e.code).toBe('NOT_AUTHENTICATED');
                }
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
                expect(
                    result[Symbol.for('zenfuse.originalPayload')],
                ).toBeDefined();
            });
        });

        describe('cancelOrder()', () => {
            it('should be defined', () => {
                expect(exchange.cancelOrder).toBeDefined();
            });

            it('should run only with keys', () => {
                try {
                    exchange.cancelOrder.bind(
                        new Exchange['spot'](),
                        env.NOT_EXECUTABLE_ORDER,
                    );
                } catch (e) {
                    expect(e).toBeInstanceOf(UserError);
                    expect(e.code).toBe('NOT_AUTHENTICATED');
                }
            });

            let result;

            it('should cancel order without errors', async () => {
                const createdOrder = await exchange.postOrder(
                    env.NOT_EXECUTABLE_ORDER,
                );

                result = await exchange.cancelOrder(createdOrder);
            });

            it('should have valid originalResponse', () => {
                expect(result).toBeDefined();
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
                try {
                    exchange.cancelOrderById.bind(
                        new Exchange['spot'](),
                        '7787',
                    );
                } catch (e) {
                    expect(e).toBeInstanceOf(UserError);
                    expect(e.code).toBe('NOT_AUTHENTICATED');
                }
            });

            let result;

            it('should cancel order without errors', async () => {
                const createdOrder = await exchange.postOrder(
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
                try {
                    exchange.fetchOrderById.bind(
                        new Exchange['spot'](),
                        'super-order-id',
                    );
                } catch (e) {
                    expect(e).toBeInstanceOf(UserError);
                    expect(e.code).toBe('NOT_AUTHENTICATED');
                }
            });

            afterAll(() => {
                if (createdOrder) {
                    exchange.cancelOrderById(createdOrder.id);
                }
            });

            it('should be defined', () => {
                expect(exchange.fetchOrderById).toBeDefined();
            });

            it('should fetch without errors', async () => {
                createdOrder = await exchange.postOrder(
                    env.NOT_EXECUTABLE_ORDER,
                );

                result = await exchange.fetchOrderById(createdOrder.id);
            });

            it('should return exact order', () => {
                expect(createdOrder).toBeDefined();
                expect(result).toBeDefined();

                expect(result.symbol).toBe(createdOrder.symbol);
                expect(result.type).toBe(createdOrder.type);
                expect(result.side).toBe(createdOrder.side);
                expect(result.quantity).toBe(createdOrder.quantity);
                expect(result.price).toBe(createdOrder.price);
                expect(result.timestamp).toBeCloseTo(
                    createdOrder.timestamp,
                    -100,
                );
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

    describe('Spot Wallet Private Stream', () => {
        if (isIntegrationTest) {
            // TODO: Mock websocket
            // console.warn('Websocket test skipped');
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
                additionalKey: env.API_ADDITIONAL_KEY
                    ? env.API_ADDITIONAL_KEY
                    : undefined,
            });

            accountDataStream = exchange.getAccountDataStream();
        });

        afterAll(() => {
            if (isExchangeTestFailed && accountDataStream.socket) {
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

                expect(accountDataStream.isSocketConnected).toBe(true);

                accountDataStream.close();
            });

            it('should emit "orderUpdate"', async () => {
                await accountDataStream.open();

                const eventPromise = new Promise((resolve) => {
                    accountDataStream.once('orderUpdate', (order) => {
                        expect(order).toMatchSchema(OrderSchema);
                        resolve(order);
                    });
                });

                const createdOrder = await exchange.postOrder(
                    env.NOT_EXECUTABLE_ORDER,
                );

                return await eventPromise.then((order) => {
                    expect(order.id).toBe(createdOrder.id);
                    exchange.cancelOrder(order);
                });
            });
        });

        describe('close()', () => {
            beforeAll(() => accountDataStream.open());
            it('should close connection', () => {
                expect(accountDataStream.isSocketConnected).toBe(true);

                accountDataStream.close();

                expect(accountDataStream.isSocketConnected).toBe(false);
            });
        });
    });

    /**
     * @typedef {import('../src/exchanges/ftx/streams/marketDataStream.js')} MarketDataStream
     */

    describe('Spot Wallet Public Stream', () => {
        if (isIntegrationTest) {
            // TODO: Mock websocket
            // console.warn('Websocket test skipped');
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

                expect(marketDataStream.isSocketConnected).toBe(true);
            });
        });

        describe('subscribeTo()', () => {
            beforeEach(async () => {
                expect(marketDataStream.isSocketConnected).toBe(true);
            });

            it('should emit "newPrice" event', (done) => {
                marketDataStream.subscribeTo(env.PRICE_SUBSCRIPTION);

                marketDataStream.once('newPrice', (p) => {
                    const schema = z.object({
                        symbol: z
                            .string()
                            .refine((s) => s.split('/').length === 2),
                        price: z.number(),
                    });
                    expect(p).toMatchSchema(schema);
                    expect(p.symbol).toBe(env.PRICE_SUBSCRIPTION.symbol);

                    marketDataStream
                        .unsubscribeFrom(env.PRICE_SUBSCRIPTION)
                        .then(done);
                });
            });

            it('should emit "candle" event', (done) => {
                marketDataStream.subscribeTo(env.CANDLE_SUBSCRIPTION);

                marketDataStream.once('candle', (p) => {
                    expect(p).toMatchSchema(KlineSchema);
                    expect(p.symbol).toBe(env.CANDLE_SUBSCRIPTION.symbol);
                    expect(p.interval).toBe(env.CANDLE_SUBSCRIPTION.interval);

                    marketDataStream
                        .unsubscribeFrom(env.CANDLE_SUBSCRIPTION)
                        .then(done);
                });
            });
        });

        describe('unsubscribeFrom()', () => {
            beforeEach(async () => {
                expect(marketDataStream.isSocketConnected).toBe(true);
            });

            it('should unsubscribed from specific event', async () => {
                expect(marketDataStream.isSocketConnected).toBe(true);

                await marketDataStream.subscribeTo(env.PRICE_SUBSCRIPTION);

                await marketDataStream.unsubscribeFrom(env.PRICE_SUBSCRIPTION);

                const listener = jest.fn();

                marketDataStream.once('kline', listener);

                return await new Promise((resolve) => {
                    setTimeout(() => {
                        expect(listener).not.toHaveBeenCalled();
                        resolve();
                    }, 3000);
                });
            });
        });

        describe('close()', () => {
            it('should close connection', () => {
                expect(marketDataStream.isSocketConnected).toBe(true);

                marketDataStream.close();

                expect(marketDataStream.isSocketConnected).toBe(false);
            });
        });
    });

    ///////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////  Global Configurations  ///////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////

    describe('Global Configurations', () => {
        if (isIntegrationTest) {
            // TODO: Mock websocket
            // console.warn('Websocket test skipped');
            return;
        }
        describe("'httpsAgent' option", () => {
            it('should use custom agent on fetching', async () => {
                const customAgent = new MockedAgent();

                zenfuse.config.set('httpsAgent', customAgent);

                await new Exchange.spot().ping();

                expect(customAgent.createConnection).toHaveBeenCalled();
            });

            it('should use custom agent on websocket', async () => {
                const customAgent = new MockedAgent();

                zenfuse.config.set('httpsAgent', customAgent);

                const exchange = new Exchange.spot();

                expect(
                    exchange.fetcher.defaults.options.agent.https,
                ).toBeInstanceOf(MockedAgent);

                await exchange
                    .getMarketDataStream()
                    .open()
                    .then((e) => e.close());

                expect(customAgent.createConnection).toHaveBeenCalled();
            });
        });
    });
};
