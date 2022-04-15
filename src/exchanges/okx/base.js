const { HTTPError } = require('got');
const mergeObjects = require('deepmerge');

const ExchangeBase = require('../../base/exchange');
const NotAuathenticatedError = require('../../base/errors/notAuthenticated.error');
const OkxApiError = require('./errors/api.error');
const OkxCache = require('./etc/cache');
const { createHmacSignature } = require('./utils');

const keysSymbol = Symbol.for('zenfuse.keyVault');

/**
 * Okx base class for method which included in any wallet type
 *
 * **DEV:** Any class what extends ExchangeBase should have same public interface
 */
class OkxBase extends ExchangeBase {
    /**
     * Http client options specialy for Okx
     *
     * @type {import('../../base/exchange').BaseOptions}
     */
    static DEFAULT_OPTIONS = {
        httpClientOptions: {
            responseType: 'json',
            prefixUrl: 'https://okx.com/',
            headers: {
                'Content-Type': 'application/json',
            },
        },
        wsClientOptions: {
            prefixUrl: 'wss://ws.okx.com:8443',
        },
    };

    /**
     * @type {OkxCache}
     */
    cache;

    /**
     * @param {import('../../base/exchange').BaseOptions} options User defined options for in http client lib
     */
    constructor(options) {
        const assignedOptions = mergeObjects(OkxBase.DEFAULT_OPTIONS, options);
        super(assignedOptions);

        this[keysSymbol] = {};

        this.cache = new OkxCache(this);
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

        const timestamp = new Date(Date.now());

        const sigParams = {
            ts: timestamp.toISOString(),
            method: options.method || 'GET',
            path: `/${url}`,
            body: options.json,
        };

        const signature = createHmacSignature(
            sigParams,
            this[keysSymbol].privateKey,
        );

        options = mergeObjects(options, {
            headers: {
                'OK-ACCESS-KEY': this[keysSymbol].publicKey,
                'OK-ACCESS-TIMESTAMP': timestamp.toISOString(),
                'OK-ACCESS-SIGN': signature,
                'OK-ACCESS-PASSPHRASE': this[keysSymbol].addKey,
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
     * @param {string} keys.addKey
     * @returns {this}
     */
    auth({ publicKey, privateKey, addKey }) {
        this[keysSymbol] = {};
        this[keysSymbol].publicKey = publicKey;
        this[keysSymbol].privateKey = privateKey;
        this[keysSymbol].addKey = addKey;
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
            !!this[keysSymbol].privateKey &&
            !!this[keysSymbol].addKey
        );
    }

    /**
     * Ping Okx servers
     *
     * @public
     */
    async ping() {
        await this.publicFetch('api/v5/public/time');
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
        console.log(err.response.body);
        if (err instanceof HTTPError) {
            throw new OkxApiError(err);
        }

        throw err;
    }
}

module.exports = OkxBase;
