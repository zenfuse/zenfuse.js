export = FtxCache;
declare class FtxCache extends BaseGlobalCache {
    /**
     * @param {FtxBase} baseInstance
     */
    constructor(baseInstance: import("../base"));
    /**
     * @typedef {import('../base')} FtxBase
     * @type {FtxBase}
     */
    base: import("../base");
    updateSelfIfRequired(): void;
    /**
     * Array of all ftx tickers
     * @type {string[]}
     */
    get tickers(): string[];
    /**
     * Array of all ftx ticker pairs
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
     * Updating global cache using raw ftx data
     * @param {*} exchageInfo Data from `api/v3/exchangeInfo` endpoint
     */
    updateCache(exchageInfo: any): void;
}
import BaseGlobalCache = require("../../../base/etc/cache");
