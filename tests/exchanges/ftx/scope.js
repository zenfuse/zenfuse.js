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
        'fetchMarkets()': () =>
            nock(HOSTNAME)
                .get('/api/markets')
                .replyWithFile(200, marketsFilePath, {
                    'Content-Type': 'application/json',
                }),
    },
});
