const { HTTPError } = require('got');
const mergeObjects = require('deepmerge');
const { createHmac } = require('crypto');

const ExchangeBase = require('../../base/exchange');
const BinanceApiError = require('./errors/api.error');
const BinanceCache = require('./etc/cache');
const RuntimeError = require('../../base/errors/runtime.error');
const UserError = require('../../base/errors/user.error');

const keysSymbol = Symbol('keys');

/**
 * Binance base class for method which included in any wallet type
 *
 * **DEV:** Any class what extends ExchangeBase should have same public interface
 */
class BinanceBase extends ExchangeBase {
    /**
     * Http client options specialy for Binance
     *
     * @type {import('../../base/exchange').BaseOptions}
     */
    static DEFAULT_OPTIONS = {
        httpClientOptions: {
            responseType: 'json',
            prefixUrl: 'https://api.binance.com/',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        },
        wsClientOptions: {
            prefixUrl: 'wss://stream.binance.com:9443/',
        },
    };
    /**
     * @type {BinanceCache}
     */
    cache;

    /**
     * @param {import('../../base/exchange').BaseOptions} options User defined options for in http client lib
     */
    constructor(options) {
        const assignedOptions = mergeObjects(
            BinanceBase.DEFAULT_OPTIONS,
            options,
        );
        super(assignedOptions);

        this[keysSymbol] = {};

        this.cache = new BinanceCache(this);

        this.signatureEncoding = 'hex';
    }

    /**
     * Make http request based on constructor settings
     *
     * @param {URL} url
     * @param {import('http').RequestOptions} options
     * @returns {object};
     */
    async publicFetch(url, options = {}) {
        if (this.hasKeys) {
            options = mergeObjects(options, {
                headers: {
                    'X-MBX-APIKEY': this[keysSymbol].publicKey,
                },
            });
        }

        return await this.fetcher(url, options).catch(this.handleFetcherError);
    }

    /**
     * Make authenticated http request based on constructor settings
     *
     * @param {URL} url
     * @param {import('http').RequestOptions} options
     * @returns {object};
     */
    async privateFetch(url, options = {}) {
        this.throwIfNotHasKeys();

        if (!options.searchParams) options.searchParams = {};

        options.searchParams.timestamp = Date.now();

        options.searchParams.signature = createHmac(
            'sha256',
            this[keysSymbol].privateKey,
        )
            .update(new URLSearchParams(options.searchParams).toString())
            .digest(this.signatureEncoding);

        options = mergeObjects(options, {
            headers: {
                'X-MBX-APIKEY': this[keysSymbol].publicKey,
            },
        });

        return await this.fetcher(url, options).catch(this.handleFetcherError);
    }

    /**
     * Connect to authentificated API
     *
     * @param {object} keys
     * @param {string} keys.publicKey
     * @param {string} keys.privateKey Same as secret key
     * @returns {this}
     */
    auth({ publicKey, privateKey }) {
        this[keysSymbol] = {};
        this[keysSymbol].publicKey = publicKey;
        this[keysSymbol].privateKey = privateKey;
        return this;
    }

    /**
     * Is instanse has keys to authenticate on not
     *
     * @type {boolean}
     */
    get hasKeys() {
        return (
            !!this[keysSymbol] &&
            !!this[keysSymbol].publicKey &&
            !!this[keysSymbol].privateKey
        );
    }

    /**
     * Ping binance servers
     *
     * @public
     */
    async ping() {
        return await this.publicFetch('api/v3/ping');
    }

    /**
     * @private
     */
    throwIfNotHasKeys() {
        if (!this.hasKeys) {
            throw new UserError(null, 'NOT_AUTHENTICATED');
        }
    }

    /**
     * @param {Error} err
     * @private
     */
    handleFetcherError(err) {
        if (err instanceof HTTPError) {
            throw new BinanceApiError(err);
        }

        throw err;
    }

    /**
     * Parses Binance symbol using cache
     *
     * @param {string} bSymbol Binance symbol without separator
     * @returns {string} Normal symbol with separator
     */
    parseBinanceSymbol(bSymbol) {
        const isSymbolCached = this.cache.parsedSymbols.get(bSymbol);

        let rawSymbol = '';

        if (!isSymbolCached) {
            const errorMsg = `Unnable to parse binance ${bSymbol} symbol`;

            // 6 length symbol can devided by 2 pieces
            if (bSymbol.length === 6) {
                const base = bSymbol.slice(0, 3);
                const quote = bSymbol.slice(3);
                rawSymbol = [base, quote];
                process.emitWarning(errorMsg, {
                    code: 'ZEFU_CACHE_UNSYNC',
                    detail: `Zenfuse cannot find a symbol in the global cache. This is a warning because this symbol possible to guess.`,
                });
            } else {
                throw new RuntimeError(errorMsg, 'ZEFU_CACHE_UNSYNC');
            }
        }

        rawSymbol = this.cache.parsedSymbols.get(bSymbol);

        return rawSymbol.join('/');
    }

    /**
     * @param {Array} symbols Array of symbols from `api/v3/exchangeInfo`
     * @returns {string[]} Array of tickers like `['BTC', 'BUSD'...]`
     */
    extractTickersFromSymbols(symbols) {
        const tickers = new Set();

        symbols.forEach((market) => {
            tickers.add(market.baseAsset);
            tickers.add(market.quoteAsset);
        });

        return [...tickers];
    }

    /**
     * @typedef {import('../../../../base/schemas/orderParams').ZenfuseOrderParams} OrderParams
     */

    /**
     * Insert default values for specific order type
     *
     * **DEV** All values should be for zenfuse interface
     *
     * @param {OrderParams} order
     * @param {object} defaults
     * @param {OrderParams} defaults.limit
     * @param {OrderParams} defaults.market
     * @returns {OrderParams}
     */
    assignDefaultsInOrder(order, defaults) {
        let newOrder;

        if (order.type.toLowerCase() === 'limit') {
            newOrder = mergeObjects(defaults.limit, order);
        }

        if (order.type.toLowerCase() === 'market') {
            newOrder = mergeObjects(defaults.market, order);
        }

        return newOrder;
    }

    /**
     * Zenfuse -> Binance
     *
     * **DEV:** This function does not assign defaults values
     *
     * @param {OrderParams} zOrder Zenfuse order
     * @returns {object} Order for binance api
     */
    transformZenfuseOrder(zOrder) {
        const TRANSFORM_LIST = [
            'side',
            'type',
            'price',
            'quantity',
            'symbol',
            'timeInForce',
        ];
        const bOrder = {};

        bOrder.symbol = zOrder.symbol.replace('/', '').toUpperCase();

        if (zOrder.type) {
            bOrder.type = zOrder.type.toUpperCase();
        }

        if (zOrder.side) {
            bOrder.side = zOrder.side.toUpperCase();
        }

        if (zOrder.price) {
            bOrder.price = zOrder.price.toString();
        }

        if (zOrder.quantity) {
            bOrder.quantity = zOrder.quantity.toString();
        }

        if (zOrder.timeInForce) {
            bOrder.timeInForce = zOrder.timeInForce.toUpperCase();
        }

        // Allow user extra keys
        for (const [key, value] of Object.entries(zOrder)) {
            if (!TRANSFORM_LIST.includes(key)) {
                bOrder[key] = value;
            }
        }

        return bOrder;
    }

    /**
     * @typedef {import('../../../../base/schemas/openOrder').PlacedOrder} PlacedOrder
     */

    /**
     * Binance -> Zenfuse
     *
     * @param {*} bOrder Order fromf
     * @returns {PlacedOrder} Zenfuse Order
     */
    transformBinanceOrder(bOrder) {
        /**
         * @type {PlacedOrder}
         */
        const zOrder = {};

        zOrder.id = bOrder.orderId.toString();
        zOrder.timestamp = bOrder.transactTime || bOrder.time;
        zOrder.type = bOrder.type.toLowerCase();
        zOrder.side = bOrder.side.toLowerCase();
        zOrder.price = parseFloat(bOrder.price);
        zOrder.quantity = parseFloat(bOrder.origQty);

        switch (bOrder.status) {
            case 'NEW':
            case 'PARTIALLY_FILLED':
                zOrder.status = 'open';
                break;
            case 'FILLED':
                zOrder.status = 'closed';
                break;
            default:
                zOrder.status = 'canceled';
        }

        return zOrder;
    }
}

module.exports = BinanceBase;
