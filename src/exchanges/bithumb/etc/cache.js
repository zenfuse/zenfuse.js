const BaseGlobalCache = require('../../../base/etc/cache');

class BithumbCache extends BaseGlobalCache {
    /**
     * @typedef {import('../base')} BithumbBase
     * @type {BithumbBase}
     */
    base;

    /**
     * @param {BithumbBase} baseInstance
     */
    constructor(baseInstance) {
        super('bithumb');
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

module.exports = BithumbCache;