/**
 * This is list of clean functions for Binance data form an API
 */

const { toBN } = require('web3-utils');
const { createHmac } = require('crypto');

const createHmacSignature = (data, key) => {
    const params = new URLSearchParams(data).toString();
    return createHmac('sha256', key).update(params).digest('hex');
};

/**
 * Transforms order object for binance POST `/order` request interface
 * @link BinanceSpot.createOrder
 */
const transformOrderForCreation = (order) => {
    const newOrder = {
        side: order.side.toUpperCase(),
        type: order.type.toUpperCase(),
    };

    if (order.price) {
        newOrder.price = toBN(order.price).toString();
    }

    if (order.amount) {
        // NOTE: "amount" should be "quantity" for binance
        newOrder.quantity = toBN(order.amount).toString();
    }

    if (order.price) {
        newOrder.price = toBN(order.price).toString();
    }

    newOrder.symbol = order.symbol.replace('/', '');

    return newOrder;
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
    transformOrderForCreation,
    getAllTickersFromSymbols,
    getOnlySpotMarkets,
    structualizeMarkets,
};
