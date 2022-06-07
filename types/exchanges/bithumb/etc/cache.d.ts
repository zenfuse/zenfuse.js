export = BitglobalCache;
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
    /**
     * @typedef {import('../../../base/schemas/openOrder').PlacedOrder} PlacedOrder
     */
    /**
     * Cache order in local cache
     *
     * @param {PlacedOrder} order
     */
    cacheOrder(order: import("../../../base/schemas/openOrder").PlacedOrder): void;
    /**
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
}
import BaseGlobalCache = require("../../../base/etc/cache");
