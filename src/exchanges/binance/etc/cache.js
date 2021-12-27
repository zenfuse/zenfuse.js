const { getCacheInstance } = require('../../../base/etc/cache');
const debug = require('../../../base/etc/debug');

class BinanceCache {
    /**
     * @typedef {import('./../base')} BinanceBase
     * @type {BinanceBase}
     */
    base;

    /**
     * Global cache binance namespace
     * @type {import('../../../base/etc/cache.js').GlobalCacheNamespace}
     * @private
     */
    cacheSingleton;

    /**
     * @param {BinanceBase} baseInstance
     */
    constructor(baseInstance) {
        this.cacheSingleton = getCacheInstance('binance');
        this.base = baseInstance;
        this.updateSelfIfRequired();
    }

    async updateSelfIfRequired() {
        // If self updating in progress
        if (this.cacheSingleton.updatingPromice) return;

        if (this.cacheSingleton.isExpired) {
            this.cacheSingleton.updatingPromice = this.base
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
        return this.cacheSingleton.tickers;
    }

    /**
     * Array of all binance ticker pairs
     * @type {string[]}
     */
    get symbols() {
        this.updateSelfIfRequired();
        return this.cacheSingleton.symbols;
    }

    /**
     * Base Tickers and all their quote pairs
     * @type {{
     *     [ticker:string]: string[]
     * }}
     */
    get optimizedTickers() {
        this.updateSelfIfRequired();
        return this.cacheSingleton.optimizedTickers;
    }

    updateCache(exchageInfo) {
        debug.log('Updating cache');
        debug.log(exchageInfo);

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

        const optimizedTickers = [];

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
                optimizedTickers[baseTicker] = allQuoteTickers;
            }
        }
        this;

        this.cacheSingleton.optimizedTickers = optimizedTickers;
        this.cacheSingleton.tickers = tickers;
        this.cacheSingleton.symbols = symbols;

        this.cacheSingleton.lastUpdateTimestamp = Date.now();
        debug.log('Cache updated', this.cacheSingleton);
    }

    purge() {
        delete this.cacheSingleton.optimizedTickers;
        delete this.cacheSingleton.tickers;
        delete this.cacheSingleton.symbols;

        this.cacheSingleton.lastUpdateTimestamp = 0;
    }
}

module.exports = BinanceCache;
