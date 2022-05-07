const mergeObjects = require('deepmerge');

/**
 * @typedef {import('../master.test').MasterTestEnvironment} MasterTestEnvironment
 */

/**
 * @type {MasterTestEnvironment}
 */
const DEFAULTS = {
    CANDLES_REQUEST: {
        symbol: 'BTC/USDT',
        interval: '1m',
    },
    BUY_MARKET_ORDER: {
        symbol: 'BTC/USDT',
        type: 'market',
        side: 'buy',
        quantity: 0.0001,
    },
    SELL_MARKET_ORDER: {
        symbol: 'BTC/USDT',
        type: 'market',
        side: 'sell',
        quantity: 0.0001,
    },
    BUY_LIMIT_ORDER: {
        symbol: 'BTC/USDT',
        type: 'limit',
        side: 'buy',
        quantity: 0.0004,
        price: 35000,
    },
    SELL_LIMIT_ORDER: {
        symbol: 'BTC/USDT',
        type: 'limit',
        side: 'sell',
        quantity: 0.0001,
        price: 55000,
    },
    NOT_EXECUTABLE_ORDER: {
        symbol: 'USDC/USDT',
        type: 'limit',
        side: 'buy',
        quantity: 20,
        price: 0.8,
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
};

/**
 * @param {MasterTestEnvironment} extra
 * @returns {MasterTestEnvironment}
 */
module.exports = (extra) => {
    const merged = mergeObjects(DEFAULTS, extra);

    // For deepmerge undefined is a legit default value
    // Overwrite it if keys doesn't exist in the environment

    if (merged.API_PRIVATE_KEY === undefined) {
        merged.API_PRIVATE_KEY = 'DUMMY_PRIVATE_KEY';
    }

    if (merged.API_PUBLIC_KEY === undefined) {
        merged.API_PUBLIC_KEY = 'DUMMY_PUBLIC_KEY';
    }

    if (merged.API_ADD_KEY === undefined) {
        merged.API_ADD_KEY = 'DUMMY_ADD_KEY';
    }

    return merged;
};
