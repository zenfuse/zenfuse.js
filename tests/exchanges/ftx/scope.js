const nock = require('nock');

const HOSTNAME = 'https://ftx.com/';

const marketsFilePath = __dirname + '/mocks/static/markets.json';
// const mockedMarkets = JSON.parse(readFileSync(marketsFilePath, 'utf-8'));

/**
 * HTTP mocking scope for FTX master test
 * Should be as
 */
module.exports = (env) => ({
    'Spot Wallet HTTP interface': {
        'ping()': {
            'should pings :)': () =>
                nock(HOSTNAME)
                    .get('/api')
                    .reply(200, { success: true, result: true }),
        },
        'fetchMarkets()': {
            'should fetch without errors': () =>
                nock(HOSTNAME)
                    .get('/api/markets')
                    .replyWithFile(200, marketsFilePath, {
                        'Content-Type': 'application/json',
                    }),
        },
        'fetchTickers()': {
            'should fetch without errors': () =>
                nock(HOSTNAME)
                    .get('/api/markets')
                    .replyWithFile(200, marketsFilePath, {
                        'Content-Type': 'application/json',
                    }),
        },
        'fetchPrice()': {
            'should fetch all prices without errors': () =>
                nock(HOSTNAME)
                    .get('/api/markets')
                    .replyWithFile(200, marketsFilePath, {
                        'Content-Type': 'application/json',
                    }),
            'should fetch specific price without errors': () =>
                nock(HOSTNAME)
                    .get('/api/markets/BTC/USDT')
                    .reply(200, {
                        success: true,
                        result: {
                            name: 'BTC/USDT',
                            enabled: true,
                            postOnly: false,
                            priceIncrement: 1.0,
                            sizeIncrement: 0.0001,
                            minProvideSize: 0.0001,
                            last: 41577.0,
                            bid: 41573.0,
                            ask: 41575.0,
                            price: 41575.0,
                            type: 'spot',
                            baseCurrency: 'BTC',
                            quoteCurrency: 'USDT',
                            underlying: null,
                            restricted: false,
                            highLeverageFeeExempt: true,
                            change1h: 0.00009622092323975848,
                            change24h: 0.0012764317711092914,
                            changeBod: -0.0002885517108711857,
                            quoteVolume24h: 116192699.7696,
                            volumeUsd24h: 116191540.1664563,
                        },
                    }),
        },
    },
});
