const { readFileSync } = require('fs');
const nock = require('nock');

const { Binance } = require('../../'); // zenfuse itself

const isEnd2EndTest = process.env.MOCK_HTTP === 'false';

const BINANCE_HOSTNAME = 'https://api.binance.com';

describe('Spot Wallet', () => {
    let binance;

    beforeAll(() => {
        binance = new Binance('spot');
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

        it('should have valid responceBody', () => {
            if (isEnd2EndTest) {
                expect(result.responceBody).toBeInstanceOf(Object);
            }

            if (!isEnd2EndTest) {
                expect(result.responceBody).toMatchObject(mockedMarkets);
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

        const mockFilePath = __dirname + '/mocks/exchangeInfo.json';
        const mockedMarkets = JSON.parse(readFileSync(mockFilePath, 'utf-8'));
        const scope = nock(BINANCE_HOSTNAME)
            .get('/api/v3/exchangeInfo')
            .replyWithFile(200, mockFilePath, {
                'Content-Type': 'application/json',
            });

        afterAll(() => scope.done());

        it('should be defined', () => {
            expect(binance.fetchTickers).toBeDefined();
        });

        it('should fetch without errors', async () => {
            result = await binance.fetchTickers().catch((err) => {
                throw err;
            });
        });

        it('should have valid responceBody', () => {
            if (isEnd2EndTest) {
                expect(result.responceBody).toBeInstanceOf(Object);
            }

            if (!isEnd2EndTest) {
                expect(result.responceBody).toMatchObject(mockedMarkets);
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
});
