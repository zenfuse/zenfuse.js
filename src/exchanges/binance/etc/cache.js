const BaseGlobalCache = require('../../../base/etc/cache');

class BinanceCache extends BaseGlobalCache {
    static ORDERS_CACHE_LENGTH = 10_000;

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
     * **DEV:** Binance requires order symbol for many requests. So we should cache orders to delete it just by id.
     *
     * @param {PlacedOrder} order
     */
    cacheOrder(order) {
        this.localCache.openOrders.set(order.id, order);
        this.careCachedOrders();
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
     * This method prevents heap out of memory on long-term process if he has many orders to post.
     *
     * @private
     */
    careCachedOrders() {
        const isShouldCut =
            this.localCache.openOrders.length >
            BinanceCache.ORDERS_CACHE_LENGTH;

        if (isShouldCut) {
            const lastOrderId = [...this.localCache.openOrders.keys()].shift();
            this.localCache.openOrders.delete(lastOrderId);
        }
    }

    /**
     * Updating global cache using raw binance data
     *
     * @param {*} exchangeInfo Data from `api/v3/exchangeInfo` endpoint
     */
    updateCache(exchangeInfo) {
        this.updateParsedSymbols(exchangeInfo);
        this.updatePrecision(exchangeInfo);
    }

    /**
     * Updating global cache using raw binance data
     *
     * @param {*} exchangeInfo Data from `api/v3/exchangeInfo` endpoint
     */
    updateParsedSymbols(exchangeInfo) {
        let tickers = new Set();
        let symbols = new Set();

        // Fill tickers
        exchangeInfo.symbols.forEach((s) => {
            tickers.add(s.baseAsset);
            tickers.add(s.quoteAsset);
        });

        // Fill symbols
        exchangeInfo.symbols.forEach((s) => {
            symbols.add(s.symbol);
        });

        tickers = [...tickers];
        symbols = [...symbols];

        const parsedSymbols = new Map();

        // TODO: Simplify this. Can work without parsing
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
    }

    /**
     * Update precision info for every market
     *
     * **DEV:** "precision" in zenfuse.js is a count of numbers after decimal point
     *
     * @param {*} exchangeInfo Data from `api/v3/exchangeInfo` endpoint
     */
    updatePrecision(exchangeInfo) {
        const precisionInfo = new Map();

        // '0.00001000' -> 5
        // '1.00000000' -> 0
        const getPrecision = (string) => {
            if (string.startsWith('1')) return 0;

            const arr = string.split('.')[1].split('');

            for (let i = 1; i <= arr.length; i++) {
                if (arr[i - 1] === '1') return i;
            }
        };

        for (const marketData of exchangeInfo.symbols) {
            const bPriceFilter = marketData.filters.find(
                ({ filterType }) => filterType === 'PRICE_FILTER',
            );

            const bQuantityFilter = marketData.filters.find(
                ({ filterType }) => filterType === 'LOT_SIZE',
            );

            const baseTicker = marketData.baseAsset;
            const quoteTicker = marketData.quoteAsset;

            precisionInfo.set([baseTicker, quoteTicker].join('/'), {
                pricePrecision: getPrecision(bPriceFilter.tickSize),
                quantityPrecision: getPrecision(bQuantityFilter.stepSize),
            });
        }

        this.globalCache.set('marketsPrecisionInfo', precisionInfo);
    }
}

module.exports = BinanceCache;
