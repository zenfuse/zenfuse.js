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
    }

    updateSelfIfRequired() {
        // If cache updating in progress
        if (this.globalCache.updatingPromise) return;

        if (this.isExpired) {
            this.globalCache.updatingPromise = {}; // TODO: Cache update
        }
    }

    /**
     * Array of all ftx tickers
     * @type {string[]}
     */
    get tickers() {
        // this.updateSelfIfRequired();
        return this.globalCache.get('tickers');
    }

    /**
     * Array of all ftx ticker pairs
     * @type {string[]}
     */
    get symbols() {
        // this.updateSelfIfRequired();
        return this.globalCache.get('symbols');
    }

    /**
     * Base Tickers and all their quote pairs
     * @type {{
     *     [ticker:string]: string[]
     * }}
     */
    get parsedSymbols() {
        // this.updateSelfIfRequired();
        return this.globalCache.get('parsedSymbols');
    }

    /**
     * Updating global cache using raw ftx data
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

        const parsedSymbols = [];

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
                    parsedSymbols[baseTicker + quoteTicker] = [
                        baseTicker,
                        quoteTicker,
                    ];
                });
            }
        }

        this.globalCache.set('parsedSymbols', parsedSymbols);
        this.globalCache.set('tickers', tickers);
        this.globalCache.set('symbols', symbols);
    }
}

module.exports = FtxCache;
