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
        this.updateSelfIfRequired();
    }

    updateSelfIfRequired() {
        // If cache updating in progress
        if (this.globalCache.updatingPromise) return;

        if (this.isExpired) {
            this.globalCache.updatingPromise = this.base
                .publicFetch('v2/settings/common/currencies')
                .then(this.updateCache.bind(this));
        }
    }

    /**
     * Array of all huobi tickers
     *
     * @type {string[]}
     */
    get tickers() {
        this.updateSelfIfRequired();
        return this.globalCache.get('tickers');
    }

    /**
     * Array of all huobi ticker pairs
     *
     * @type {string[]}
     */
    get symbols() {
        this.updateSelfIfRequired();
        return this.globalCache.get('symbols');
    }

    /**
     * Base Tickers and all their quote pairs
     *
     * @returns {Object.<string, string[]>}
     */
    get parsedSymbols() {
        this.updateSelfIfRequired();
        return this.globalCache.get('parsedSymbols');
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

    /**
     * Updating global cache using raw huobi data
     *
     * @param {*} rawMarkets Data from `api/v3/exchangeInfo` endpoint
     */
    updateCache(rawMarkets) {
        let tickers = new Set();
        let symbols = new Set();

        // Fill tickers and symbols
        rawMarkets.data.forEach((m) => {
            tickers.add(m.bc);
            tickers.add(m.qc);
            symbols.add(m.sc);
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
                    parsedSymbols.set(rawSymbol, [
                        baseTicker.toUpperCase(),
                        quoteTicker.toUpperCase(),
                    ]);
                });
            }
        }

        this.globalCache.set('parsedSymbols', parsedSymbols);
        this.globalCache.set('tickers', tickers);
        this.globalCache.set('symbols', symbols);
    }
}

module.exports = HuobiCache;
