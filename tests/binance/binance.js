const { readFileSync } = require('fs');
const nock = require('nock');

const { Binance } = require('../../'); // zenfuse itself

const isEnd2EndTest = process.env.MOCK_HTTP === 'false';

const BINANCE_HOSTNAME = 'https://api.binance.com';

describe('Spot Wallet', () => {
    describe('ping()', () => {
        it('should be defined', () => {
            expect(new Binance('spot').ping).toBeDefined();
        });
        it('should pings :)', async () => {
            const scope = nock(BINANCE_HOSTNAME)
                .get('/api/v3/ping')
                .reply(200, {});

            await new Binance('spot').ping();

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
            expect(new Binance('spot').fetchMarkets).toBeDefined();
        });

        it('should fetch without errors', async () => {
            result = await new Binance('spot').fetchMarkets().catch((err) => {
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

        it('should match schema', () => {
            // console.log(result);
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
            expect(new Binance('spot').fetchTickers).toBeDefined();
        });

        it('should fetch without errors', async () => {
            result = await new Binance('spot').fetchTickers().catch((err) => {
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

        it('should match schema', () => {
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
