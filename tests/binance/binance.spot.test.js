const { readFileSync } = require('fs');
const nock = require('nock');

const { Binance } = require('../../src'); // zenfuse itself

const isEnd2EndTest = process.env.TEST_MODE === 'e2e';
const isIntegrationTest = !isEnd2EndTest;

/**
 * @type {import('../../src/base/exchange').BaseOptions}
 */
const INSTANCE_OPTIONS = {
    httpClientOptions: {
        prefixUrl: 'https://testnet.binance.vision/',
    },
    wsClientOptions: {
        prefixUrl: 'wss://testnet.binance.vision/',
    },
};

const API_PUBLIC_KEY = process.env.BINANCE_SPOT_TESTNET_PUBLIC_KEY;
const API_SECRET_KEY = process.env.BINANCE_SPOT_TESTNET_SECRET_KEY;

// const API_PUBLIC_KEY =
// '5qD36aO5550ROVcpdizSYX71k3QNdgLjJ9bkORCRzXlCVEetYIZADLM11GCCKCfT';
// const API_SECRET_KEY =
// 'kqjIAjkYm2XybdEAevvBBmhNPpyFLVV9D2Vkxge7fcym6ucOwHKGKyM666GwzRow';

const binanceHostname = INSTANCE_OPTIONS.httpClientOptions.prefixUrl;

///////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////  BINANCE HTTP INTERFACE  ///////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////

describe('Binance Spot Wallet HTTP interface', () => {
    /**
     * @type {import('../../src/exchanges/binance/wallets/spot')}
     */
    let binance;

    beforeAll(() => {
        binance = new Binance('spot', INSTANCE_OPTIONS);
    });

    describe('ping()', () => {
        it('should be defined', () => {
            expect(binance.ping).toBeDefined();
        });
        it('should pings :)', async () => {
            const scope = nock(binanceHostname)
                .get('/api/v3/ping')
                .reply(200, {});

            await binance.ping();

            scope.done();
        });
    });

    describe('fetchMarkets()', () => {
        let result;

        const mockFilePath = __dirname + '/mocks/static/exchangeInfo.json';
        const mockedMarkets = JSON.parse(readFileSync(mockFilePath, 'utf-8'));
        const scope = nock(binanceHostname)
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
            result;
        });

        it('should have valid originalResponce', () => {
            if (isEnd2EndTest) {
                expect(result.originalResponce).toBeInstanceOf(Object);
            }

            if (isIntegrationTest) {
                expect(result.originalResponce).toMatchObject(mockedMarkets);
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
            scope = nock(binanceHostname)
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

        it('should have valid originalResponce', () => {
            if (isEnd2EndTest) {
                expect(result.originalResponce).toBeInstanceOf(Object);
            }

            if (isIntegrationTest) {
                expect(result.originalResponce).toMatchObject(mockedMarkets);
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

    ///////////////////////////////////////////////////////////////

    //// Private API Zone

    ///////////////////////////////////////////////////////////////

    describe.only('auth()', () => {
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

    describe('createOrder()', () => {
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

            const scope = nock(binanceHostname)
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

            it('should have valid originalResponce', () => {
                expect(result).toBeDefined();

                if (isEnd2EndTest) {
                    expect(result.originalResponce).toBeInstanceOf(Object);
                }

                if (isIntegrationTest) {
                    expect(result.originalResponce).toMatchObject(
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

            const scope = nock(binanceHostname)
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

            it('should have valid originalResponce', () => {
                expect(result).toBeDefined();

                if (isEnd2EndTest) {
                    expect(result.originalResponce).toBeInstanceOf(Object);
                }

                if (isIntegrationTest) {
                    expect(result.originalResponce).toMatchObject(
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

            const scope = nock(binanceHostname)
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

            it('should have valid originalResponce', () => {
                expect(result).toBeDefined();

                if (isEnd2EndTest) {
                    expect(result.originalResponce).toBeInstanceOf(Object);
                }

                if (isIntegrationTest) {
                    expect(result.originalResponce).toMatchObject(
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

            const scope = nock(binanceHostname)
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

            it('should have valid originalResponce', () => {
                expect(result).toBeDefined();

                if (isEnd2EndTest) {
                    expect(result.originalResponce).toBeInstanceOf(Object);
                }

                if (isIntegrationTest) {
                    expect(result.originalResponce).toMatchObject(
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

        const scope = nock(binanceHostname)
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

        it('should have valid originalResponce', () => {
            if (isEnd2EndTest) {
                expect(result.originalResponce).toBeInstanceOf(Object);
            }

            if (isIntegrationTest) {
                expect(result.originalResponce).toMatchObject(mockedBalances);
            }
        });
    });

    describe.only('cancelOrder()', () => {
        let result;

        // TODO: Testnet support

        const orderParams = {
            symbol: 'BUSD/USDT',
            type: 'limit',
            side: 'buy',
            amount: '20',
            price: '0.5',
        };

        it('shoud cancel order without errors', async () => {
            const { createdOrder } = await binance.createOrder(orderParams);

            result = await binance.cancelOrder({ id: createdOrder.orderId });

            expect(result).toBeDefined();
        });

        it('should have valid originalResponce', () => {
            if (isEnd2EndTest) {
                expect(result.originalResponce).toBeInstanceOf(Object);
            }

            if (isIntegrationTest) {
                // expect(result.originalResponce).toMatchObject();
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

describe('Binance Spot Wallet UserDataStream', () => {
    if (isIntegrationTest) {
        // TODO: Mock websocket
        console.warn('Websoket test skipped');
        return;
    }

    let userDataStream;
    let binance;

    beforeAll(() => {
        binance = new Binance('spot', INSTANCE_OPTIONS).auth({
            publicKey: API_PUBLIC_KEY,
            privateKey: API_SECRET_KEY,
        });

        userDataStream = binance.getUserDataStream();
    });

    afterAll(() => {
        userDataStream.close();
    });

    describe('open()', () => {
        const scope = nock(binanceHostname)
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
                symbol: 'BNB/USDT',
                type: 'market',
                side: 'sell',
                amount: '1',
            };

            const orderUpdate = new Promise((resolve) => {
                userDataStream.once('orderUpdate', resolve);
            });

            const tickersChanged = new Promise((resolve) => {
                userDataStream.once('tickersChanged', resolve);
            });

            binance.createOrder(orderParams);

            return await Promise.all([orderUpdate, tickersChanged]);
        });
    });
});
