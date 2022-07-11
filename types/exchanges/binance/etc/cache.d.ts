export = BinanceCache;
declare class BinanceCache extends BaseGlobalCache {
    static ORDERS_CACHE_LENGTH: number;
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
     * Base Tickers and all their quote pairs
     *
     * @returns {Object<string, string[]>}
     */
    get parsedSymbols(): {
        [x: string]: string[];
    };
    /**
     * @typedef {import('../../../base/schemas/openOrder').PlacedOrder} PlacedOrder
     */
    /**
     * Cache order in local cache
     *
     * **DEV:** Binance requires order symbol for many requests. So we should cache orders to delete it just by id.
     *
     * @param {PlacedOrder} order
     */
    cacheOrder(order: import("../../../base/schemas/openOrder").PlacedOrder): void;
    /**
     *
     * @param {string} orderId
     * @returns {PlacedOrder}
     */
    getCachedOrderById(orderId: string): import("../../../base/schemas/openOrder").PlacedOrder;
    /**
     *
     * @param {string} orderId
     * @returns {boolean}
     */
    deleteCachedOrderById(orderId: string): boolean;
    /**
     * This method prevents heap out of memory on long-term process if he has many orders to post.
     *
     * @private
     */
    private careCachedOrders;
    /**
     * Updating global cache using raw binance data
     *
     * @param {*} exchangeInfo Data from `api/v3/exchangeInfo` endpoint
     */
    updateCache(exchangeInfo: any): void;
    /**
     * Updating global cache using raw binance data
     *
     * @param {*} exchangeInfo Data from `api/v3/exchangeInfo` endpoint
     */
    updateParsedSymbols(exchangeInfo: any): void;
    /**
     * Update precision info for every market
     *
     * **DEV:** "precision" in zenfuse.js is a count of numbers after decimal point
     *
     * @param {*} exchangeInfo Data from `api/v3/exchangeInfo` endpoint
     */
    updatePrecision(exchangeInfo: any): void;
}
import BaseGlobalCache = require("../../../base/etc/cache");
