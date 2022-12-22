const { Huobi } = require('zenfuse');

const masterTest = require('../../master.test');
const createScope = require('./scope');
const checkProcessHasVariables = require('../../helpers/validateEnv');
const createEnv = require('../../helpers/createEnv');

if (isEnd2EndTest) {
    checkProcessHasVariables(['HUOBI_PUBLIC_KEY', 'HUOBI_SECRET_KEY']);
}

/**
 * @type {import('../../master.test').MasterTestEnvironment}
 */
const env = createEnv({
    API_PUBLIC_KEY: process.env.HUOBI_PUBLIC_KEY,
    API_PRIVATE_KEY: process.env.HUOBI_SECRET_KEY,
    NOT_EXECUTABLE_ORDER: {
        symbol: 'BTC/USDT',
        type: 'limit',
        side: 'buy',
        quantity: 0.0005,
        price: 20000,
    },
    BUY_MARKET_ORDER: {
        symbol: 'BTC/USDT',
        type: 'market',
        side: 'buy',
        quantity: 0.0006,
    },
    SELL_MARKET_ORDER: {
        symbol: 'BTC/USDT',
        type: 'market',
        side: 'sell',
        quantity: 0.000598,
    },
    BUY_LIMIT_ORDER: {
        symbol: 'BTC/USDT',
        type: 'limit',
        side: 'buy',
        quantity: 0.00056,
        price: 18000,
    },
    SELL_LIMIT_ORDER: {
        symbol: 'BTC/USDT',
        type: 'limit',
        side: 'sell',
        quantity: 0.0006,
        price: 18000,
    },
    PRICE_SUBSCRIPTION: {
        channel: 'price',
        symbol: 'BTC/USDT',
    },
    CANDLE_SUBSCRIPTION: {
        channel: 'candle',
        symbol: 'BTC/USDT',
        interval: '1m',
    },
    PRECISION_REQUIRED_ORDER: {
        symbol: 'DOGE/USDT',
        side: 'buy',
        type: 'limit',
        quantity: 144.4646464664,
        price: 0.0824198888,
    },
    PRECISION_IMPOSSIBLE_ORDER: {
        symbol: 'DOGE/USDT',
        side: 'buy',
        type: 'limit',
        quantity: 0.00000000001,
        price: 0.00000000000001,
    },
});

global.httpScope = createScope(env);

masterTest(Huobi, env);
