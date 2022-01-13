/* eslint-disable no-undef */
const { readFileSync } = require('fs');
const nock = require('nock');

const checkProcessHasVariables = require('../../helpers/validateEnv');
const { Binance } = require('../../../src/index.js'); // zenfuse itself

if (isEnd2EndTest) {
    checkProcessHasVariables(['BINANCE_PUBLIC_KEY', 'BINANCE_SECRET_KEY']);
}

const API_PUBLIC_KEY = process.env.BINANCE_PUBLIC_KEY || 'DUMMY_PUBLIC_KEY';
const API_SECRET_KEY = process.env.BINANCE_SECRET_KEY || 'DUMMY_SECRET_KEY';

const HOSTNAME = 'https://api.binance.com/';

/**
 * @typedef {import('../../../src/exchanges/binance/wallets/spot.js')} BinanceSpot
 */

describe('Binance Options usage', () => {
    /**
     * @type {BinanceSpot}
     */
    let binance;

    describe('useCache', () => {
        it('should use cache by default', async () => {
            const mockFilePath = __dirname + '/mocks/static/exchangeInfo.json';
            nock(HOSTNAME)
                .get('/api/v3/exchangeInfo')
                .replyWithFile(200, mockFilePath, {
                    'Content-Type': 'application/json',
                });

            binance = new Binance['spot']();

            await binance.cache.globalCache.updatingPromise;

            // TODO: Find beter way to check cache
            expect(binance.cache.globalCache.has('tickers')).toBe(true);
            expect(binance.cache.globalCache.has('symbols')).toBe(true);
            expect(binance.cache.globalCache.has('parsedSymbols')).toBe(true);

            // scope.done(); TODO: Somehow this thing not working
        });

        it.skip('should not use when `useCache: false` specified', () => {
            binance = new Binance['spot']({
                useCache: false,
            });

            expect(binance.cache).toBeUndefined();
        });
    });
});

///////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////  BINANCE HTTP INTERFACE  ///////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////

describe('Binance Spot Wallet HTTP interface', () => {
    /**
     * @type {BinanceSpot}
     */
    let binance;

    beforeAll(() => {
        binance = new Binance['spot']();
    });

    describe('ping()', () => {
        it('should be defined', () => {
            expect(binance.ping).toBeDefined();
        });
        it('should pings :)', async () => {
            const scope = nock(HOSTNAME).get('/api/v3/ping').reply(200, {});

            await binance.ping();

            scope.done();
        });
    });

    describe('fetchMarkets()', () => {
        let result;

        const mockFilePath = __dirname + '/mocks/static/exchangeInfo.json';
        const mockedMarkets = JSON.parse(readFileSync(mockFilePath, 'utf-8'));
        const scope = nock(HOSTNAME)
            .get('/api/v3/exchangeInfo')
            .replyWithFile(200, mockFilePath, {
                'Content-Type': 'application/json',
            });

        afterAll(() => {
            if (isMasterTestFailed) return;
            scope.done();
        });

        it('should be defined', () => {
            expect(binance.fetchMarkets).toBeDefined();
        });

        it('should fetch without errors', async () => {
            result = await binance.fetchMarkets();
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
            mockFilePath = __dirname + '/mocks/static/exchangeInfo.json';
            mockedMarkets = JSON.parse(readFileSync(mockFilePath, 'utf-8'));
            scope = nock(HOSTNAME)
                .get('/api/v3/exchangeInfo')
                .replyWithFile(200, mockFilePath, {
                    'Content-Type': 'application/json',
                });
        }

        afterAll(() => {
            if (isMasterTestFailed) return;
            scope.done();
        });

        it('should be defined', () => {
            expect(binance.fetchTickers).toBeDefined();
        });

        it('should fetch without errors', async () => {
            result = await binance.fetchTickers();
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


        let scope = { done() {} };

        if (isIntegrationTest) {
            mockFilePath = __dirname + '/mocks/static/prices.json';
            mockedPrices = JSON.parse(readFileSync(mockFilePath, 'utf-8'));
            scope = nock(HOSTNAME)
                .get('/api/v3/ticker/price')
                .replyWithFile(200, mockFilePath, {
                    'Content-Type': 'application/json',
                })
                .get('/api/v3/ticker/price')
                .query({ symbol: mockedResponce.symbol })
                .reply(200, mockedResponce);
        }

        afterAll(() => {
            if (isMasterTestFailed) return;
            scope.done();
        });

        it('should be defined', () => {
            expect(binance.fetchPrice).toBeDefined();
        });

        it('should fetch all prices without errors', async () => {
            result = await binance.fetchPrice();
        });

        it('should have valid originalRespone', () => {
            if (isEnd2EndTest) {
                expect(
                    Array.isArray(
                        result[Symbol.for('zenfuse.originalPayload')],
                    ),
                ).toBe(true);
            }

            if (isIntegrationTest) {
                expect(
                    result[Symbol.for('zenfuse.originalPayload')],
                ).toHaveLength(mockedPrices.length);
            }
        });

        it('should fetch specific price without errors', async () => {
            result = await binance.fetchPrice('BNB/BUSD');
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

    describe('auth()', () => {
        it('should bo defined', () => {
            expect(binance.auth).toBeDefined();
        });

        it('should pass keys to instance', () => {
            const keys = {
                publicKey: API_PUBLIC_KEY,
                privateKey: API_SECRET_KEY,
            };

            expect(binance.hasKeys).toBe(false);

            binance.auth(keys);

            expect(binance.hasKeys).toBe(true);
        });
    });

    describe('createOrder()', () => {
        it('should be defined', () => {
            expect(binance.createOrder).toBeDefined();
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
                symbol: 'BNB/USDT',
                type: 'market',
                side: 'buy',
                quantity: '1',
            };

            const binanceRequestExpectation = {
                side: 'BUY',
                type: 'MARKET',
                quantity: '1',
                symbol: 'BNBUSDT',
            };

            // const mockedCreatedOrder = ;

            const scope = nock(HOSTNAME)
                .matchHeader('X-MBX-APIKEY', API_PUBLIC_KEY)
                .post('/api/v3/order')
                .query((q) => {
                    expect(q).toMatchObject(binanceRequestExpectation);
                    return true;
                })
                .reply(201, mockedCreatedOrder);

            afterAll(() => {
                if (isMasterTestFailed) return;
                scope.done();
            });

            it('should create order without errors', async () => {
                result = await binance.createOrder(orderParams);
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
                symbol: 'BNB/USDT',
                type: 'market',
                side: 'sell',
                quantity: '1',
            };

            const binanceRequestExpectation = {
                side: 'SELL',
                type: 'MARKET',
                quantity: '1',
                symbol: 'BNBUSDT',
            };

            const mockedCreatedOrder = {
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
            };

            const scope = nock(HOSTNAME)
                .matchHeader('X-MBX-APIKEY', API_PUBLIC_KEY)
                .post('/api/v3/order')
                .query((q) => {
                    expect(q).toMatchObject(binanceRequestExpectation);
                    return true;
                })
                .reply(201, mockedCreatedOrder);

            afterAll(() => {
                if (isMasterTestFailed) return;
                scope.done();
            });

            it('should create order without errors', async () => {
                result = await binance.createOrder(orderParams);
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
                symbol: 'BNB/USDT',
                type: 'limit',
                side: 'buy',
                quantity: '1',
                price: '500',
            };

            const binanceRequestExpectation = {
                side: 'BUY',
                type: 'LIMIT',
                quantity: '1', // same as amount
                price: '500',
                symbol: 'BNBUSDT',
                timeInForce: 'GTC',
            };

            const mockedCreatedOrder = {
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
            };

            const scope = nock(HOSTNAME)
                .matchHeader('X-MBX-APIKEY', API_PUBLIC_KEY)
                .post('/api/v3/order')
                .query((q) => {
                    expect(q).toMatchObject(binanceRequestExpectation);
                    return true;
                })
                .reply(201, mockedCreatedOrder);

            afterAll(() => {
                if (isMasterTestFailed) return;
                scope.done();
            });

            it('should create order without errors', async () => {
                result = await binance.createOrder(orderParams);
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
                symbol: 'BNB/USDT',
                type: 'limit',
                side: 'buy',
                quantity: '1',
                price: '500',
                timeInForce: 'IOC', // Not default parameter
            };

            const binanceRequestExpectation = {
                side: 'BUY',
                type: 'LIMIT',
                quantity: '1', // same as amount
                price: '500',
                symbol: 'BNBUSDT',
                timeInForce: 'IOC',
            };

            const mockedCreatedOrder = {
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
            };

            const scope = nock(HOSTNAME)
                .matchHeader('X-MBX-APIKEY', API_PUBLIC_KEY)
                .post('/api/v3/order')
                .query((q) => {
                    expect(q).toMatchObject(binanceRequestExpectation);
                    return true;
                })
                .reply(201, mockedCreatedOrder);

            afterAll(() => {
                if (isMasterTestFailed) return;
                scope.done();
            });

            it('should create order without errors', async () => {
                result = await binance.createOrder(orderParams);
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
            expect(binance.fetchBalances).toBeDefined();
        });

        let result;

        const mockedBalances = {
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
                { asset: 'BNB', free: '1002.00000000', locked: '0.00000000' },
                { asset: 'BTC', free: '0.00000000', locked: '0.00000000' },
                { asset: 'BUSD', free: '9883.26000000', locked: '0.00000000' },
                { asset: 'ETH', free: '100.00000000', locked: '0.00000000' },
                { asset: 'LTC', free: '500.00000000', locked: '0.00000000' },
                { asset: 'TRX', free: '500000.00000000', locked: '0.00000000' },
                { asset: 'USDT', free: '57080.70341854', locked: '0.00000000' },
                { asset: 'XRP', free: '50000.00000000', locked: '0.00000000' },
            ],
            permissions: ['SPOT'],
        };

        const scope = nock(HOSTNAME)
            .matchHeader('X-MBX-APIKEY', API_PUBLIC_KEY)
            .get('/api/v3/account')
            .query((query) => {
                expect(query.timestamp).toBeDefined();
                return true;
            })
            .reply(200, mockedBalances);

        afterAll(() => {
            if (isMasterTestFailed) return;
            scope.done();
        });

        it('should fetch without errors', async () => {
            result = await binance.fetchBalances();
            result;
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

    describe('cancelOrder()', () => {
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
            if (isMasterTestFailed) return;
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
                const newOrder = await binance.createOrder(orderParams);
                createdOrder = newOrder.createdOrder;
            }

            result = await binance.cancelOrder({ id: createdOrder.orderId });

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
///////////////////////////////   BINANCE WEBSOCKET INTERFACE   ///////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////

const MOCKED_LISTEN_KEY = {
    listenKey: 'hellositwhenairdropwhenbinance',
};

/**
 * @typedef {import('../../../src/exchanges/binance/streams/userDataStream.js')} AccountDataStream
 */

describe('Binance Spot Wallet Private Stream', () => {
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
        binance = new Binance['spot']().auth({
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
            if (isMasterTestFailed) return;
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
 * @typedef {import('../../../src/exchanges/binance/streams/publicStream.js')} MarketDataStream
 */

describe('Binance Spot Wallet Public Stream', () => {
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
    let binance;

    beforeAll(() => {
        binance = new Binance['spot']();

        marketDataStream = binance.getMarketDataStream();
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
