const { HTTPError } = require('got');
const mergeObjects = require('deepmerge');

const ExchangeBase = require('../../base/exchange');
const NotAuathenticatedError = require('../../base/errors/notAuthenticated.error');
const HuobiApiError = require('./errors/api.error');
const HuobiCache = require('./etc/cache');
const { createHmacSignature } = require('./utils');
const ZenfuseRuntimeError = require('../../base/errors/runtime.error');

const keysSymbol = Symbol('keys');

/**
 * Huobi base class for method which included in any wallet type
 *
 * **DEV:** Any class what extends ExchangeBase should have same public interface
 */
class HuobiBase extends ExchangeBase {
    /**
     * Http client options specialy for Huobi
     *
     * @type {import('../../base/exchange').BaseOptions}
     */
    static DEFAULT_OPTIONS = {
        httpClientOptions: {
            responseType: 'json',
            prefixUrl: 'https://api.huobi.pro/',
            headers: {
                'Content-Type': 'application/json',
            },
        },
        wsClientOptions: {
            prefixUrl: 'wss://api.huobi.pro/',
        },
    };
    /**
     * @type {HuobiCache}
     */
    cache;

    /**
     * @param {import('../../base/exchange').BaseOptions} options User defined options for in http client lib
     */
    constructor(options) {
        const assignedOptions = mergeObjects(
            HuobiBase.DEFAULT_OPTIONS,
            options,
        );
        super(assignedOptions);

        this[keysSymbol] = {};

        this.cache = new HuobiCache(this);
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
     * Ping huobi servers
     *
     * @public
     */
    async ping() {
        return await this.publicFetch('v1/common/timestamp');
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
            throw new HuobiApiError(err);
        }

        throw err;
    }

    /**
     * Parses huobi symbol using cache
     *
     * @param {string} bSymbol Huobi symbol without separator
     * @returns {string} Normal symbol with separator
     */
    parseHuobiSymbol(bSymbol) {
        const isSymbolCached = this.cache.parsedSymbols.get(bSymbol);

        let rawSymbol = '';

        if (!isSymbolCached) {
            const errorMsg = `Unnable to parse huobi ${bSymbol} symbol`;

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

module.exports = HuobiBase;
