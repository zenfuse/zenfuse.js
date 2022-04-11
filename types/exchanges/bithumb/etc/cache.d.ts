export = BithumbCache;
declare class BithumbCache extends BaseGlobalCache {
    /**
     * @param {BithumbBase} baseInstance
     */
    constructor(baseInstance: import("../base"));
    /**
     * @typedef {import('../base')} BithumbBase
     * @type {BithumbBase}
     */
    base: import("../base");
    localCache: {
        openOrders: Map<any, any>;
    };
    /**
     * Cache order in local cache
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
