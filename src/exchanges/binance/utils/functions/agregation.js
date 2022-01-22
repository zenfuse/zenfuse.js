/**
 * @param {Array} symbols Array of symbols from `api/v3/exchangeInfo`
 * @returns {string[]} Array of tickers like `['BTC', 'BUSD'...]`
 */
const extractTickersFromSymbols = (symbols) => {
    const tickers = new Set();

    symbols.forEach((market) => {
        tickers.add(market.baseAsset);
        tickers.add(market.quoteAsset);
    });

    return [...tickers];
};

/**
 * @param {Array} symbols List of symbols from `api/v3/exchangeInfo` endpoint
 * @returns {Array} Symbols only with spot type
 */
const extractSpotMarkets = (symbols) => {
    return symbols.filter((market) => market.permissions.includes('SPOT'));
};

/**
 * Structualizing all markets to one interface
 *
 * @param {Array} markets
 * @returns {{
 *      symbol: string,
 *      baseTicker: string
 *      quoteTicker: string
 * }}
 */
const structualizeMarkets = (markets) => {
    return markets.map((market) => {
        return {
            symbol: `${market.baseAsset}/${market.quoteAsset}`,
            baseTicker: market.baseAsset,
            quoteTicker: market.quoteAsset,
        };
    });
};

module.exports = {
    extractTickersFromSymbols,
    extractSpotMarkets,
    structualizeMarkets,
};
