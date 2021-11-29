/**
 * This is list of clean functions for Binance data form an API
 */
const mergeObjects = require('deepmerge');

const { createHmac } = require('crypto');

const createHmacSignature = (data, key) => {
    const params = new URLSearchParams(data).toString();
    return createHmac('sha256', key).update(params).digest('hex');
};

/**
 * Insert default values for specific order type
 *
 * @param {object} order
 * @param {object} defaults
 * @param {object} defaults.limit
 * @param {object} defaults.market
 *
 * @returns TODO: Order type
 */
const insertDefaults = (order, defaults) => {
    let newOrder;

    if (order.type === 'LIMIT') {
        newOrder = mergeObjects(defaults.limit, order);
    }

    if (order.type === 'MARKET') {
        newOrder = mergeObjects(defaults.market, order);
    }

    return newOrder;
};

/**
 * Transforms order object for binance POST `/order` request interface
 * @param {import('./wallets/spot').createOrder}
 */
const transformOrderValues = (order) => {
    const shouldTransform = [
        'side',
        'type',
        'price',
        'amount',
        'symbol',
        'timeInForce',
    ];

    const transformedOrder = {};

    if (order.type) {
        transformedOrder.type = order.type.toUpperCase();
    }

    if (order.side) {
        transformedOrder.side = order.side.toUpperCase();
    }

    if (order.price) {
        transformedOrder.price = order.price.toString();
    }

    if (order.amount) {
        // NOTE: "amount" should be "quantity" for binance
        transformedOrder.quantity = order.amount.toString();
    }

    if (order.timeInForce) {
        transformedOrder.timeInForce = order.timeInForce.toUpperCase();
    }

    transformedOrder.symbol = order.symbol.replace('/', '').toUpperCase();

    // Allow user extra keys
    for (const [key, value] of Object.entries(order)) {
        if (!shouldTransform.includes(key)) {
            transformedOrder[key] = value;
        }
    }

    return transformedOrder;
};

/**
 * @param {array} symbols Array of symbols from `api/v3/exchangeInfo`
 * @returns {string[]} Array of tickers like `['BTC', 'BUSD'...]`
 */
const getAllTickersFromSymbols = (symbols) => {
    const tickers = new Set();

    symbols.forEach((market) => {
        tickers.add(market.baseAsset);
        tickers.add(market.quoteAsset);
    });

    return [...tickers];
};

/**
 * @param {array} symbols List of symbols from `api/v3/exchangeInfo` endpoint
 * @returns {array} Symbols only with spot type
 */
const getOnlySpotMarkets = (symbols) => {
    return symbols.filter((market) => market.permissions.includes('SPOT'));
};

/**
 * Structualizing all markets to one interface
 *
 * @param {array} markets
 * @returns {{
 *      symbol: string,
 *      baseTicker: string
 *      quoteTicker: string
 * }}
 */
const structualizeMarkets = (markets) => {
    return markets.map((market) => {
        return {
            symbol: market.symbol,
            baseTicker: market.baseAsset,
            quoteTicker: market.quoteAsset,
        };
    });
};

module.exports = {
    createHmacSignature,
    insertDefaults,
    transformOrderValues,
    getAllTickersFromSymbols,
    getOnlySpotMarkets,
    structualizeMarkets,
};
