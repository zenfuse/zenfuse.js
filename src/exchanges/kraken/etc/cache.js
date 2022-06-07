const BaseGlobalCache = require('../../../base/etc/cache');

class KrakenCache extends BaseGlobalCache {
    /**
     * @typedef {import('../base')} KrakenBase
     * @type {KrakenBase}
     */
    base;

    /**
     * @param {KrakenBase} baseInstance
     */
    constructor(baseInstance) {
        super('kraken');
        this.base = baseInstance;
        this.localCache = {
            openOrders: new Map(),
        };
        this.updateSelfIfRequired();
    }

    updateSelfIfRequired() {
        // If cache updating in progress
        if (this.globalCache.updatingPromise) return;

        if (this.isExpired) {
            this.globalCache.updatingPromise = this.base
                .publicFetch('0/public/AssetPairs')
                .then(this.updateCache.bind(this));
        }
    }

    /**
     * Base Tickers and all their quote pairs
     *
     * @returns {Object<string, string[]>}
     */
    get parsedSymbols() {
        this.updateSelfIfRequired();
        return this.globalCache.get('parsedSymbols');
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

    /**
     * Updating global cache using raw binance data
     *
     * @param {*} exchangeInfo Data from `0/public/AssetPairs` endpoint
     */
    updateCache(exchangeInfo) {
        let tickers = new Set();
        let symbols = new Set();

        // Fill tickers
        Object.entries(exchangeInfo.result).forEach(([, value]) => {
            tickers.add(value.base);
            tickers.add(value.quote);
            symbols.add(value.altname);
        });

        tickers = [...tickers];
        symbols = [...symbols];

        const parsedSymbols = new Map();

        // Create optimized tickers
        for (const baseTicker of tickers) {
            const allQuoteTickers = symbols
                .map((s) => {
                    if (!s.startsWith(baseTicker)) return;

                    const quote = s.substring(baseTicker.length); // 'BTCUSDT' -> 'USDT'

                    if (tickers.includes(quote)) return quote;
                })
                .filter(Boolean);

            // Write to cache if base ticker has any quote tickers
            if (allQuoteTickers.length > 0) {
                allQuoteTickers.forEach((quoteTicker) => {
                    const rawSymbol = baseTicker + quoteTicker;
                    parsedSymbols.set(rawSymbol, [baseTicker, quoteTicker]);
                });
            }
        }

        this.globalCache.set('parsedSymbols', parsedSymbols);
        this.globalCache.set('tickers', tickers);
        this.globalCache.set('symbols', symbols);
    }
}

module.exports = KrakenCache;
