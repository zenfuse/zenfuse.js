/**
 * @param {object[]} markets Markets from FTX `/api/markets` endpoint
 * @returns {object[]}
 */
export function extractSpotMarkets(markets: object[]): object[];
/**
 * @param {object[]} markets Markets from FTX `/api/markets` endpoint
 * @returns {object[]}
 */
export function extractTickersFromMarkets(markets: object[]): object[];
