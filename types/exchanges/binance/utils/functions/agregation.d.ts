/**
 * @param {Array} symbols Array of symbols from `api/v3/exchangeInfo`
 * @returns {string[]} Array of tickers like `['BTC', 'BUSD'...]`
 */
export function extractTickersFromSymbols(symbols: any[]): string[];
/**
 * @param {Array} symbols List of symbols from `api/v3/exchangeInfo` endpoint
 * @returns {Array} Symbols only with spot type
 */
export function extractSpotMarkets(symbols: any[]): any[];
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
export function structualizeMarkets(markets: any[]): {
    symbol: string;
    baseTicker: string;
    quoteTicker: string;
};
