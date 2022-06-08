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
     * Updating global cache using raw binance data
     *
     * @param {*} exchangeInfo Data from `api/v3/exchangeInfo` endpoint
     */
    updateCache(exchangeInfo: any): void;
}
import BaseGlobalCache = require("../../../base/etc/cache");
