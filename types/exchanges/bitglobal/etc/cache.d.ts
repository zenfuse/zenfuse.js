export = BitglobalCache;
/**
 * @typedef {import('../../../base/schemas/openOrder').PlacedOrder} PlacedOrder
 */
declare class BitglobalCache extends BaseGlobalCache {
    /**
     * @param {BitglobalBase} baseInstance
     */
    constructor(baseInstance: import("../base"));
    /**
     * @typedef {import('../base')} BitglobalBase
     * @type {BitglobalBase}
     */
    base: import("../base");
    localCache: {
        openOrders: Map<any, any>;
    };
    updateSelfIfRequired(): void;
    /**
     * Updating global cache using
     *
     * @param {*} body Body from `openapi/v1/spot/config` endpoint
     */
    updateCache(body: any): void;
    /**
     * **DEV:** "precision" in zenfuse.js is a count of numbers after decimal point
     *
     * @param {*} body Body from `openapi/v1/spot/config` endpoint
     */
    updatePrecision(body: any): void;
    /**
     * Cache order in local cache
     *
     * @param {PlacedOrder} order
     */
    cacheOrder(order: PlacedOrder): void;
    /**
     * @param {string} orderId
     * @returns {PlacedOrder}
     */
    getCachedOrderById(orderId: string): PlacedOrder;
    /**
     *
     * @param {string} orderId
     * @returns {boolean}
     */
    deleteCachedOrderById(orderId: string): boolean;
}
declare namespace BitglobalCache {
    export { PlacedOrder };
}
import BaseGlobalCache = require("../../../base/etc/cache");
type PlacedOrder = import('../../../base/schemas/openOrder').PlacedOrder;
