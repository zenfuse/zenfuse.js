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
                .publicFetch('v2/settings/common/symbols')
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
     * @returns {Object<string, string[]>}
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
     * Updating global cache using raw binance data
     *
     * @param {*} rawMarkets Data from `v2/settings/common/symbols` endpoint
     */
    updateCache(rawMarkets) {
        this.updateParsedSymbols(rawMarkets);
        this.updatePrecision(rawMarkets);
    }

    /**
     * Updating global cache using raw huobi data
     *
     * @param {*} rawMarkets Data from `v2/settings/common/symbols` endpoint
     */
    updateParsedSymbols(rawMarkets) {
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

    /**
     * Update precision info for every market
     *
     * **DEV:** "precision" in zenfuse.js is a count of numbers after decimal point
     *
     * @param {*} rawMarkets Data from `api/v3/exchangeInfo` endpoint
     */
    updatePrecision(rawMarkets) {
        const precisionInfo = new Map();

        for (const marketData of rawMarkets.data) {
            const baseTicker = marketData.bcdn; // base currency display name
            const quoteTicker = marketData.qcdn; // quote currency display name

            precisionInfo.set([baseTicker, quoteTicker].join('/'), {
                pricePrecision: marketData.ttp, // trade total precision
                quantityPrecision: marketData.tap, // trade amount precision
                totalPrecision: marketData.ttp, // trade total precision
            });
        }

        this.globalCache.set('marketsPrecisionInfo', precisionInfo);
    }
}

module.exports = HuobiCache;
