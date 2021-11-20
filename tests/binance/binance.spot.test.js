const { readFileSync } = require('fs');
const nock = require('nock');

const { Binance } = require('../../src'); // zenfuse itself

const isEnd2EndTest = process.env.MOCK_HTTP === 'false';

const BINANCE_HOSTNAME = 'https://testnet.binance.vision';

const API_PUBLIC_KEY = process.env.BINANCE_SPOT_TESTNET_PUBLIC_KEY;
const API_SECRET_KEY = process.env.BINANCE_SPOT_TESTNET_SECRET_KEY;

describe('Spot Wallet', () => {
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

            if (!isEnd2EndTest) {
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

        if (!isEnd2EndTest) {
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

            if (!isEnd2EndTest) {
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
                symbol: 'BTC/USDT',
                type: 'market',
                side: 'sell',
                amount: '1',
            };

            const binanceRequestExpectation = {
                side: 'SELL',
                type: 'MARKET',
                quantity: '1',
                symbol: 'BTCUSDT',
            };

            const mockedResponse = {
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
                .reply(201, mockedResponse);

            afterAll(() => scope.done());

            it('should create order without errors', async () => {
                result = await binance.createOrder(orderParams);
                console.log(result);
            });

            it('should have valid responseBody', () => {
                expect(result).toBeDefined();

                if (isEnd2EndTest) {
                    expect(result.responseBody).toBeInstanceOf(Object);
                }

                if (!isEnd2EndTest) {
                    expect(result).toBeDefined();
                    expect(result.responseBody).toMatchObject(mockedResponse);
                }
            });
        });
    });
});
