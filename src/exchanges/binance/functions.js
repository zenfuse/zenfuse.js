/**
 * This is list of clean functions for Binance data form an API
 */

/**
 * @param {array} symbols Array of symbols from `api/v3/exchangeInfo`
 * @returns {string[]} Array of tickers like `['BTC', 'BUSD'...]`
 */
const getAllTickers = (symbols) => {
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
    getAllTickers,
    getOnlySpotMarkets,
    structualizeMarkets,
};
