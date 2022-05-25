const BaseGlobalCache = require('../../../base/etc/cache');

class BiboxCache extends BaseGlobalCache {
    /**
     * @typedef {import('../base')} BiboxBase
     * @type {BiboxBase}
     */
    base;

    /**
     * @param {BiboxBase} baseInstance
     */
    constructor(baseInstance) {
        super('bibox');
        this.base = baseInstance;
        this.localCache = {
            openOrders: new Map(),
        };
    }

    /**
     * @typedef {import('../../../base/schemas/openOrder').PlacedOrder} PlacedOrder
     */

    /**
     * Cache order in local cache
     *
     * @param {PlacedOrder} order
     */
    cacheOrder(order) {
        this.localCache.openOrders.set(order.id, order);
    }

    /**
     *
     * @param {string} orderId
     * @returns {PlacedOrder}
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

module.exports = BiboxCache;