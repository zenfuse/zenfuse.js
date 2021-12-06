/* eslint-disable no-undef */
const { readFileSync } = require('fs');
const nock = require('nock');

const checkProcessHasVariables = require('../../helpers/validateEnv');
const { Binance } = require('../../../src/index.js'); // zenfuse itself

if (isEnd2EndTest) {
    checkProcessHasVariables(['BINANCE_PUBLIC_KEY', 'BINANCE_SECRET_KEY']);
}

const API_PUBLIC_KEY = process.env.BINANCE_PUBLIC_KEY;
const API_SECRET_KEY = process.env.BINANCE_SECRET_KEY;

const HOSTNAME = 'https://api.binance.com/';

/**
 * @typedef {import('../../../src/exchanges/binance/wallets/spot.js')} BinanceSpot
 */

///////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////  BINANCE HTTP INTERFACE  ///////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////

describe('Binance Spot Wallet HTTP interface', () => {
    /**
     * @type {BinanceSpot}
     */
    let binance;

    beforeAll(() => {
        binance = new Binance('spot');
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

        afterAll(() => scope.done());

        it('should be defined', () => {
            expect(binance.fetchMarkets).toBeDefined();
        });

        it('should fetch without errors', async () => {
            result = await binance.fetchMarkets();
        });

        it('should have valid originalResponse', () => {
            if (isEnd2EndTest) {
                expect(result.originalResponse).toBeInstanceOf(Object);
            }

            if (isIntegrationTest) {
                expect(result.originalResponse).toMatchObject(mockedMarkets);
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
            expect(result.markets).toMatchSchema(schema);
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

        afterAll(() => scope.done());

        it('should be defined', () => {
            expect(binance.fetchTickers).toBeDefined();
        });

        it('should fetch without errors', async () => {
            result = await binance.fetchTickers().catch((err) => {
                throw err;
            });
        });

        it('should have valid originalResponse', () => {
            if (isEnd2EndTest) {
                expect(result.originalResponse).toBeInstanceOf(Object);
            }

            if (isIntegrationTest) {
                expect(result.originalResponse).toMatchObject(mockedMarkets);
            }
        });

        it('should return valid schema', () => {
            const schema = {
                type: 'array',
                items: {
                    type: 'string',
                },
            };
            expect(result.tickers).toMatchSchema(schema);
        });
    });

    describe('fetchPrice()', () => {
        let result;

        let mockFilePath;
        let mockedPrices;

        const mockedResponce = {
            symbol: 'BNBBUSD',
            price: '9999999.999999',
        };

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

        afterAll(() => scope.done());

        it('should be defined', () => {
            expect(binance.fetchPrice).toBeDefined();
        });

        it('should fetch all prices without errors', async () => {
            result = await binance.fetchPrice();
        });

        it('should have valid originalRespone', () => {
            if (isEnd2EndTest) {
                expect(Array.isArray(result.originalResponse)).toBe(true);
            }

            if (isIntegrationTest) {
                expect(result.originalResponse).toMatchObject(mockedPrices);
            }
        });

        it('should fetch specific price without errors', async () => {
            result = await binance.fetchPrice('BNB/BUSD');
        });

        it('should have valid originalResponse', () => {
            if (isEnd2EndTest) {
                expect(result.originalResponse).toBeInstanceOf(Object);
            }

            if (isIntegrationTest) {
                expect(result.originalResponse).toMatchObject(mockedResponce);
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

            binance.auth(keys);

            expect(binance._keys).toMatchObject(keys);
        });
    });

    describe.skip('createOrder()', () => {
        it('should be defined', () => {
            expect(binance.createOrder).toBeDefined();
        });

        describe('buy by market', () => {
            let result;

            const orderParams = {
                symbol: 'BNB/USDT',
                type: 'market',
                side: 'buy',
                amount: '1',
            };

            const binanceRequestExpectation = {
                side: 'BUY',
                type: 'MARKET',
                quantity: '1',
                symbol: 'BNBUSDT',
            };

            const mockedCreatedOrder = {
                symbol: 'BNBUSDT',
                orderId: 5114608,
                orderListId: -1,
                clientOrderId: 'nVuwTgVfxQtsMV9uuMMXxL',
                transactTime: 1637596926709,
                price: '0.00000000',
                origQty: '1.00000000',
                executedQty: '1.00000000',
                cummulativeQuoteQty: '576.46100000',
                status: 'FILLED',
                timeInForce: 'GTC',
                type: 'MARKET',
                side: 'BUY',
                fills: [
                    {
                        price: '576.30000000',
                        qty: '0.77000000',
                        commission: '0.00000000',
                        commissionAsset: 'BNB',
                        tradeId: 239238,
                    },
                    {
                        price: '577.00000000',
                        qty: '0.23000000',
                        commission: '0.00000000',
                        commissionAsset: 'BNB',
                        tradeId: 239239,
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

            afterAll(() => scope.done());

            it('should create order without errors', async () => {
                result = await binance.createOrder(orderParams);
            });

            it('should have valid originalResponse', () => {
                expect(result).toBeDefined();

                if (isEnd2EndTest) {
                    expect(result.originalResponse).toBeInstanceOf(Object);
                }

                if (isIntegrationTest) {
                    expect(result.originalResponse).toMatchObject(
                        mockedCreatedOrder,
                    );
                }
            });
        });
        describe('sell by market', () => {
            let result;

            const orderParams = {
                symbol: 'BNB/USDT',
                type: 'market',
                side: 'sell',
                amount: '1',
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

            afterAll(() => scope.done());

            it('should create order without errors', async () => {
                result = await binance.createOrder(orderParams);
            });

            it('should have valid originalResponse', () => {
                expect(result).toBeDefined();

                if (isEnd2EndTest) {
                    expect(result.originalResponse).toBeInstanceOf(Object);
                }

                if (isIntegrationTest) {
                    expect(result.originalResponse).toMatchObject(
                        mockedCreatedOrder,
                    );
                }
            });
        });

        describe('buy by limit', () => {
            let result;

            const orderParams = {
                symbol: 'BNB/USDT',
                type: 'limit',
                side: 'buy',
                amount: '1',
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

            afterAll(() => scope.done());

            it('should create order without errors', async () => {
                result = await binance.createOrder(orderParams);
            });

            it('should have valid originalResponse', () => {
                expect(result).toBeDefined();

                if (isEnd2EndTest) {
                    expect(result.originalResponse).toBeInstanceOf(Object);
                }

                if (isIntegrationTest) {
                    expect(result.originalResponse).toMatchObject(
                        mockedCreatedOrder,
                    );
                }
            });
        });

        describe('sell by limit', () => {
            let result;

            const orderParams = {
                symbol: 'BNB/USDT',
                type: 'limit',
                side: 'buy',
                amount: '1',
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

            afterAll(() => scope.done());

            it('should create order without errors', async () => {
                result = await binance.createOrder(orderParams);
            });

            it('should have valid originalResponse', () => {
                expect(result).toBeDefined();

                if (isEnd2EndTest) {
                    expect(result.originalResponse).toBeInstanceOf(Object);
                }

                if (isIntegrationTest) {
                    expect(result.originalResponse).toMatchObject(
                        mockedCreatedOrder,
                    );
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

        afterAll(() => scope.done());

        it('should fetch without errors', async () => {
            result = await binance.fetchBalances();
        });

        it('should have valid originalResponse', () => {
            if (isEnd2EndTest) {
                expect(result.originalResponse).toBeInstanceOf(Object);
            }

            if (isIntegrationTest) {
                expect(result.originalResponse).toMatchObject(mockedBalances);
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

        afterAll(() => scope.done());

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
                expect(result.originalResponse).toBeInstanceOf(Object);
            }

            if (isIntegrationTest) {
                expect(result.originalResponse).toMatchObject(mockedOrder);
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
 * @typedef {import('../../../src/exchanges/binance/streams/userDataStream.js')} UserDataStream
 */

describe('Binance Spot Wallet UserDataStream', () => {
    if (isIntegrationTest) {
        // TODO: Mock websocket
        console.warn('Websoket test skipped');
        return;
    }

    /**
     * @type {UserDataStream}
     */
    let userDataStream;

    /**
     * @type {BinanceSpot}
     */
    let binance;

    beforeAll(() => {
        binance = new Binance('spot').auth({
            publicKey: API_PUBLIC_KEY,
            privateKey: API_SECRET_KEY,
        });

        userDataStream = binance.getUserDataStream();
    });

    afterAll(() => {
        expect(userDataStream.isSocketConneted).toBe(false);
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

        afterAll(() => scope.done());

        it('should connect to websocket', async () => {
            await userDataStream.open();

            expect(userDataStream.isSocketConneted).toBe(true);
        });

        it('should emit events on order creation', async () => {
            const orderParams = {
                symbol: 'BUSD/USDT',
                type: 'limit',
                side: 'buy',
                amount: '20',
                price: '0.5',
            };

            const orderUpdatePromice = new Promise((resolve) => {
                userDataStream.once('orderUpdate', resolve);
            });

            const tickersChangedPromice = new Promise((resolve) => {
                userDataStream.once('tickersChanged', resolve);
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
            expect(userDataStream.isSocketConneted).toBe(true);

            userDataStream.close();

            expect(userDataStream.isSocketConneted).toBe(false);
        });
    });
});

/**
 * @typedef {import('../../../src/exchanges/binance/streams/publicStream.js')} PublicStream
 */

describe('Binance Spot Wallet Public Stream', () => {
    if (isIntegrationTest) {
        // TODO: Mock websocket
        console.warn('Websoket test skipped');
        return;
    }

    /**
     * @type {PublicStream}
     */
    let publicStream;

    /**
     * @type {BinanceSpot}
     */
    let binance;

    beforeAll(() => {
        binance = new Binance('spot').auth({
            publicKey: API_PUBLIC_KEY,
            privateKey: API_SECRET_KEY,
        });

        publicStream = binance.getPublicStream();
    });

    describe('open()', () => {
        it('should connect to websocket', async () => {
            await publicStream.open();

            expect(publicStream.isSocketConneted).toBe(true);
        });
    });

    describe.skip('subscribeOnEvent()', () => {});

    describe('close()', () => {
        it('should close connection', () => {
            expect(publicStream.isSocketConneted).toBe(true);

            publicStream.close();

            expect(publicStream.isSocketConneted).toBe(false);
        });
    });
});
