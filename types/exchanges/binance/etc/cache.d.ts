export = BinanceCache;
declare class BinanceCache extends BaseGlobalCache {
    /**
     * @param {BinanceBase} baseInstance
     */
    constructor(baseInstance: import("../base"));
    /**
     * @typedef {import('../base')} BinanceBase
     * @type {BinanceBase}
     */
    base: import("../base");
    updateSelfIfRequired(): void;
    /**
     * Array of all binance tickers
     * @type {string[]}
     */
    get tickers(): string[];
    /**
     * Array of all binance ticker pairs
     * @type {string[]}
     */
    get symbols(): string[];
    /**
     * Base Tickers and all their quote pairs
     * @type {{
     *     [ticker:string]: string[]
     * }}
     */
    get parsedSymbols(): {
        [ticker: string]: string[];
    };
    /**
     * Updating global cache using raw binance data
     * @param {*} exchageInfo Data from `api/v3/exchangeInfo` endpoint
     */
    updateCache(exchageInfo: any): void;
}
import BaseGlobalCache = require("../../../base/etc/cache");
