const { HTTPError } = require('got');
const mergeObjects = require('deepmerge');

const ExchangeBase = require('../../base/exchange');
const NotAuathenticatedError = require('../../base/errors/notAuthenticated.error');
const FtxApiError = require('./errors/api.error');
const FtxCache = require('./etc/cache');
const { createHmacSignature } = require('./utils');

const keysSymbol = Symbol('keys');

/**
 * FTX base class for method which included in any wallet type
 * @important Any class what extends ExchangeBase should have same public interface
 */
class FtxBase extends ExchangeBase {
    /**
     * Http client options specialy for FTX
     * @type {import('../../base/exchange').BaseOptions}
     */
    static DEFAULT_OPTIONS = {
        httpClientOptions: {
            responseType: 'json',
            prefixUrl: 'https://ftx.com/',
            headers: {
                'Content-Type': 'application/json',
            },
        },
        wsClientOptions: {
            prefixUrl: 'wss://ftx.com/',
        },
    };
    /**
     * @type {FtxCache}
     */
    cache;

    /**
     * @param {import('../../base/exchange').BaseOptions} options User defined options for in http client lib
     */
    constructor(options) {
        const assignedOptions = mergeObjects(FtxBase.DEFAULT_OPTIONS, options);
        super(assignedOptions);

        this[keysSymbol] = {};

        this.cache = new FtxCache(this);
    }

    /**
     * Make http request based on constructor settings
     *
     * @param {URL} url
     * @param {import('http').RequestOptions} options
     * @returns {object};
     */
    async publicFetch(url, options = {}) {
        return await this.fetcher(url, options).catch(this.handleFetcherError);
        // TODO: FTX Responce checker
    }

    /**
     * Make authenticated http request based on constructor settings
     *
     * @param {string} url
     * @param {import('http').RequestOptions} options
     * @returns {any}
     */
    async privateFetch(url, options = {}) {
        this.throwIfNotHasKeys();

        const timestamp = Date.now();

        const sigParams = {
            ts: timestamp,
            method: options.method || 'GET',
            path: `/${url}`,
            body: options.body,
        };

        const signature = createHmacSignature(
            sigParams,
            this[keysSymbol].privateKey,
        );

        options = mergeObjects(options, {
            headers: {
                'FTX-KEY': this[keysSymbol].publicKey,
                'FTX-TS': timestamp,
                'FTX-SIGN': signature,
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
     * Ping ftx servers
     * @public
     */
    async ping() {
        throw 'Not implemented';
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
            throw new FtxApiError(err);
        }

        throw err;
    }
}

module.exports = FtxBase;
