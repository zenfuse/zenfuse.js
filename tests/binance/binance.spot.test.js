const { readFileSync } = require('fs');
const nock = require('nock');

const { Binance } = require('../../src'); // zenfuse itself

const isEnd2EndTest = process.env.TEST_MODE === 'e2e';
const isIntegrationTest = !isEnd2EndTest;

const BINANCE_HOSTNAME = 'https://testnet.binance.vision';

const API_PUBLIC_KEY = process.env.BINANCE_SPOT_TESTNET_PUBLIC_KEY;
const API_SECRET_KEY = process.env.BINANCE_SPOT_TESTNET_SECRET_KEY;

describe('Binance Spot Wallet', () => {
    let binance;

    beforeAll(() => {
        binance = new Binance('spot', {
            prefixUrl: BINANCE_HOSTNAME,
        });
    });

    describe('ping()', () => {
        it('should be defined', () => {
            expect(binance.ping).toBeDefined();
        });
        it('should pings :)', async () => {
            const scope = nock(BINANCE_HOSTNAME)
                .get('/api/v3/ping')
                .reply(200, {});

            await binance.ping();

            scope.done();
        });
    });

    describe('fetchMarkets()', () => {
        let result;

        const mockFilePath = __dirname + '/mocks/exchangeInfo.json';
        const mockedMarkets = JSON.parse(readFileSync(mockFilePath, 'utf-8'));
        const scope = nock(BINANCE_HOSTNAME)
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

        it('should have valid responseBody', () => {
            if (isEnd2EndTest) {
                expect(result.responseBody).toBeInstanceOf(Object);
            }

            if (isIntegrationTest) {
                expect(result.responseBody).toMatchObject(mockedMarkets);
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
            mockFilePath = __dirname + '/mocks/exchangeInfo.json';
            mockedMarkets = JSON.parse(readFileSync(mockFilePath, 'utf-8'));
            scope = nock(BINANCE_HOSTNAME)
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

        it('should have valid responseBody', () => {
            if (isEnd2EndTest) {
                expect(result.responseBody).toBeInstanceOf(Object);
            }

            if (isIntegrationTest) {
                expect(result.responseBody).toMatchObject(mockedMarkets);
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

    describe('createOrder()', () => {
        it('should be defined', () => {
            expect(binance.createOrder).toBeDefined();
        });

        describe('market order', () => {
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
                symbol: 'BTCUSDT',
                orderId: 28,
                orderListId: -1,
                clientOrderId: '6gCrw2kRUAF9CvJDGP16IP',
                transactTime: 1507725176595,
                price: '0.00000000',
                origQty: '10.00000000',
                executedQty: '10.00000000',
                cummulativeQuoteQty: '10.00000000',
                status: 'FILLED',
                timeInForce: 'GTC',
                type: 'MARKET',
                side: 'SELL',
                fills: [],
            };

            const scope = nock(BINANCE_HOSTNAME)
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

            it('should have valid responseBody', () => {
                expect(result).toBeDefined();

                if (isEnd2EndTest) {
                    expect(result.responseBody).toBeInstanceOf(Object);
                }

                if (isIntegrationTest) {
                    expect(result.responseBody).toMatchObject(
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

        const scope = nock(BINANCE_HOSTNAME)
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

        it('should have valid responseBody', () => {
            if (isEnd2EndTest) {
                expect(result.responseBody).toBeInstanceOf(Object);
            }

            if (isIntegrationTest) {
                expect(result.responseBody).toMatchObject(mockedBalances);
            }
        });
    });
});
