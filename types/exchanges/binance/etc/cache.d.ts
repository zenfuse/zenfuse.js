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
    localCache: {
        openOrders: Map<any, any>;
    };
    updateSelfIfRequired(): void;
    /**
     * Array of all binance tickers
     *
     * @type {string[]}
     */
    get tickers(): string[];
    /**
     * Array of all binance ticker pairs
     *
     * @type {string[]}
     */
    get symbols(): string[];
    /**
     * Base Tickers and all their quote pairs
     *
     * @type {{
     *     [ticker:string]: string[]
     * }}
     */
    get parsedSymbols(): {
        [ticker: string]: string[];
    };
    /**
     * Cache order in local cache
     *
     * @reason Binance requires order symbol for many requests. So we should cache orders to delete it just by id.
     * @param {ZenfuseOrder} order
     */
    cacheOrder(order: ZenfuseOrder): void;
    /**
     *
     * @param {string} orderId
     * @returns {ZenfuseOrder}
     */
    getCachedOrderById(orderId: string): ZenfuseOrder;
    /**
     *
     * @param {string} orderId
     * @returns {boolead}
     */
    deleteCachedOrderById(orderId: string): boolead;
    /**
     * Updating global cache using raw binance data
     *
     * @param {*} exchageInfo Data from `api/v3/exchangeInfo` endpoint
     */
    updateCache(exchageInfo: any): void;
}
import BaseGlobalCache = require("../../../base/etc/cache");
