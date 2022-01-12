const nock = require('nock');
const assert = require('assert');
const util = require('util');
const utils = require('../../../src/exchanges/ftx/utils');

const HOSTNAME = 'https://ftx.com/';

const marketsFilePath = __dirname + '/mocks/static/markets.json';
// const mockedMarkets = JSON.parse(readFileSync(marketsFilePath, 'utf-8'));

/**
 * HTTP mocking scope for FTX master test
 * Should be as
 */
module.exports = (env) => ({
    'Spot Wallet HTTP interface': {
        'ping()': () =>
            nock(HOSTNAME)
                .get('/api')
                .reply(200, { success: true, result: true }),
        'fetchMarkets()': () =>
            nock(HOSTNAME)
                .get('/api/markets')
                .replyWithFile(200, marketsFilePath, {
                    'Content-Type': 'application/json',
                }),
        'fetchTickers()': () =>
            nock(HOSTNAME)
                .get('/api/markets')
                .replyWithFile(200, marketsFilePath, {
                    'Content-Type': 'application/json',
                }),
        'fetchPrice()': () =>
            nock(HOSTNAME)
                .get('/api/markets')
                .replyWithFile(200, marketsFilePath, {
                    'Content-Type': 'application/json',
                })
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
        'createOrder()': {
            'buy by market': () =>
                nock(HOSTNAME)
                    .matchHeader('FTX-KEY', env.API_PUBLIC_KEY)
                    .matchHeader('FTX-TS', Boolean)
                    .matchHeader('FTX-SIGN', Boolean)
                    .post('/api/orders', {
                        market: 'BTC/USDT',
                        side: 'buy',
                        type: 'market',
                        price: null,
                        size: 0.0004,
                    })
                    .reply(201, {
                        success: true,
                        result: {
                            id: 112582179056,
                            clientId: null,
                            market: 'BTC/USDT',
                            type: 'market',
                            side: 'buy',
                            price: null,
                            size: 0.0004,
                            status: 'new',
                            filledSize: 0,
                            remainingSize: 0.0004,
                            reduceOnly: false,
                            liquidation: null,
                            avgFillPrice: null,
                            postOnly: false,
                            ioc: true,
                            createdAt: '2022-01-11T17:41:47.235109+00:00',
                            future: null,
                        },
                    }),
        },
    },
});
