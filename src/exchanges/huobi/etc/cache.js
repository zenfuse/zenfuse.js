const BaseGlobalCache = require('../../../base/etc/cache');

class HuobiCache extends BaseGlobalCache {
    /**
     * @typedef {import('../base')} HuobiBase
     * @type {HuobiBase}
     */
    base;

    /**
     * @param {HuobiBase} baseInstance
     */
    constructor(baseInstance) {
        super('huobi');
        this.base = baseInstance;
        this.localCache = {
            openOrders: new Map(),
        };
    }

    /**
     * Cache order in local cache
     *
     * @param {ZenfuseOrder} order
     */
    cacheOrder(order) {
        this.localCache.openOrders.set(order.id, order);
    }

    /**
     *
     * @param {string} orderId
     * @returns {ZenfuseOrder}
     */
    getCachedOrderById(orderId) {
        return this.localCache.openOrders.get(orderId);
    }

    /**
     *
     * @param {string} orderId
     * @returns {boolean}
     */
    deleteCachedOrderById(orderId) {
        return this.localCache.openOrders.delete(orderId);
    }
}

module.exports = HuobiCache;
