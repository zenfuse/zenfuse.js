/**
 * @param {array} symbols Array of symbols from `api/v3/exchangeInfo`
 * @returns {string[]} Array of tickers like `['BTC', 'BUSD'...]`
 */
export function getAllTickersFromSymbols(symbols: any[]): string[];
/**
 * @param {array} symbols List of symbols from `api/v3/exchangeInfo` endpoint
 * @returns {array} Symbols only with spot type
 */
export function getOnlySpotMarkets(symbols: any[]): any[];
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
export function structualizeMarkets(markets: any[]): {
    symbol: string;
    baseTicker: string;
    quoteTicker: string;
};
