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
    localCache: {
        openOrders: Map<any, any>;
    };
    /**
     * @typedef {import('../../../base/schemas/openOrder').PlacedOrder} PlacedOrder
     */
    /**
     * Cache order in local cache
     *
     * **DEV:** In some cases FTX doesnt return order from REST interface. Zenfuse return cached order.
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
}
import BaseGlobalCache = require("../../../base/etc/cache");
