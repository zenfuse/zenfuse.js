const BaseGlobalCache = require('../../../base/etc/cache');

class BinanceCache extends BaseGlobalCache {
    /**
     * @typedef {import('../base')} BinanceBase
     * @type {BinanceBase}
     */
    base;

    /**
     * @param {BinanceBase} baseInstance
     */
    constructor(baseInstance) {
        super('binance');
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
                .publicFetch('api/v3/exchangeInfo')
                .then(this.updateCache.bind(this));
        }
    }

    /**
     * Array of all binance tickers
     * @type {string[]}
     */
    get tickers() {
        this.updateSelfIfRequired();
        return this.globalCache.get('tickers');
    }

    /**
     * Array of all binance ticker pairs
     * @type {string[]}
     */
    get symbols() {
        this.updateSelfIfRequired();
        return this.globalCache.get('symbols');
    }

    /**
     * Base Tickers and all their quote pairs
     * @type {{
     *     [ticker:string]: string[]
     * }}
     */
    get parsedSymbols() {
        this.updateSelfIfRequired();
        return this.globalCache.get('parsedSymbols');
    }

    /**
     * Cache order in local cache
     *
     * @reason Binance requires order symbol for many requests. So we should cache orders to delete it just by id.
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
     * @returns {boolead}
     */
    deleteCachedOrderById(orderId) {
        return this.localCache.openOrders.delete(orderId);
    }

    /**
     * Updating global cache using raw binance data
     * @param {*} exchageInfo Data from `api/v3/exchangeInfo` endpoint
     */
    updateCache(exchageInfo) {
        let tickers = new Set();
        let symbols = new Set();

        // Fill tickers
        exchageInfo.symbols.forEach((s) => {
            tickers.add(s.baseAsset);
            tickers.add(s.quoteAsset);
        });

        // Fill symbols
        exchageInfo.symbols.forEach((s) => {
            symbols.add(s.symbol);
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

module.exports = BinanceCache;
