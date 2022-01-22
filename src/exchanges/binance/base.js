const { HTTPError } = require('got');
const mergeObjects = require('deepmerge');

const ExchangeBase = require('../../base/exchange');
const NotAuathenticatedError = require('../../base/errors/notAuthenticated.error');
const BinanceApiError = require('./errors/api.error');
const BinanceCache = require('./etc/cache');
const { createHmacSignature } = require('./utils');
const ZenfuseRuntimeError = require('../../base/errors/runtime.error');

const keysSymbol = Symbol('keys');

/**
 * Binance base class for method which included in any wallet type
 *
 * @important Any class what extends ExchangeBase should have same public interface
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

        options.searchParams.signature = createHmacSignature(
            options.searchParams,
            this[keysSymbol].privateKey,
        );

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
            throw new NotAuathenticatedError();
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
                throw new ZenfuseRuntimeError(errorMsg, 'ZEFU_CACHE_UNSYNC');
            }
        }

        rawSymbol = this.cache.parsedSymbols.get(bSymbol);

        return rawSymbol.join('/');
    }
}

module.exports = BinanceBase;
