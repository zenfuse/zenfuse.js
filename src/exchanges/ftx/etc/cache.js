const BaseGlobalCache = require('../../../base/etc/cache');

class FtxCache extends BaseGlobalCache {
    /**
     * @typedef {import('../base')} FtxBase
     * @type {FtxBase}
     */
    base;

    /**
     * @param {FtxBase} baseInstance
     */
    constructor(baseInstance) {
        super('ftx');
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
     * **DEV:** In some cases FTX doesn't return order from REST interface. Zenfuse return cached order.
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

module.exports = FtxCache;
