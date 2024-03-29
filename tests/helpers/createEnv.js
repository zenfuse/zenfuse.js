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
        price: 20000,
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
    PRECISION_REQUIRED_ORDER: {
        symbol: 'DOGE/USDT',
        side: 'buy',
        type: 'limit',
        quantity: 400.30303003,
        price: 0.04688849384834938,
    },
    PRECISION_IMPOSSIBLE_ORDER: {
        symbol: 'DOGE/USDT',
        side: 'buy',
        type: 'limit',
        quantity: 0.1,
        price: 0.000000000000001,
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

    if (merged.API_ADDITIONAL_KEY === undefined) {
        merged.API_ADDITIONAL_KEY = 'DUMMY_ADD_KEY';
    }

    return merged;
};
