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
     * Cache order in local cache
     *
     * **DEV:** In some cases FTX doesnt return order from REST interface. Zenfuse return cached order.
     *
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
     * @returns {boolean}
     */
    deleteCachedOrderById(orderId: string): boolean;
}
import BaseGlobalCache = require("../../../base/etc/cache");
