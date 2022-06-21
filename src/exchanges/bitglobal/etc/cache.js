const BaseGlobalCache = require('../../../base/etc/cache');

/**
 * @typedef {import('../../../base/schemas/openOrder').PlacedOrder} PlacedOrder
 */

class BitglobalCache extends BaseGlobalCache {
    /**
     * @typedef {import('../base')} BitglobalBase
     * @type {BitglobalBase}
     */
    base;

    /**
     * @param {BitglobalBase} baseInstance
     */
    constructor(baseInstance) {
        super('bitglobal');
        this.base = baseInstance;
        this.localCache = {
            openOrders: new Map(),
        };

        this.updateSelfIfRequired();
    }

    updateSelfIfRequired() {
        // If cache updating in progress
        if (this.globalCache.updatingPromise) return;

        if (!this.isExpired) return;

        this.globalCache.updatingPromise = this.base
            .publicFetch('spot/config')
            .then(this.updateCache.bind(this));
    }

    /**
     * Updating global cache using
     *
     * @param {*} body Body from `openapi/v1/spot/config` endpoint
     */
    updateCache(body) {
        this.updatePrecision(body);
    }

    /**
     * **DEV:** "precision" in zenfuse.js is a count of numbers after decimal point
     *
     * @param {*} body Body from `openapi/v1/spot/config` endpoint
     */
    updatePrecision(body) {
        const precisionInfo = new Map();

        for (const marketData of body.data.spotConfig) {
            const [baseTicker, quoteTicker] = marketData.symbol.split('-');

            precisionInfo.set([baseTicker, quoteTicker].join('/'), {
                pricePrecision: marketData.accuracy[0],
                quantityPrecision: marketData.accuracy[1],
            });
        }

        this.globalCache.set('marketsPrecisionInfo', precisionInfo);
    }

    /**
     * Cache order in local cache
     *
     * @param {PlacedOrder} order
     */
    cacheOrder(order) {
        this.localCache.openOrders.set(order.id, order);
    }

    /**
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

module.exports = BitglobalCache;
