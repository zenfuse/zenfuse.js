const { HTTPError } = require('got');
const mergeObjects = require('deepmerge');

const ExchangeBase = require('../../base/exchange');
const NotAuathenticatedError = require('../../base/errors/notAuthenticated.error');
const BinanceApiError = require('./errors/api.error');
const { createHmacSignature } = require('./utils');

/**
 * Http client options specialy for Binance
 * @type {import('../../base/exchange').BaseOptions}
 */
const BINANCE_DEFAULT_OPTIONS = {
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

const keysSymbol = Symbol('keys');

/**
 * Binance base class for method whitch included in any wallet type
 * @important Any class what extends ExchangeBase should have same public interface
 */
class BinanceBase extends ExchangeBase {
    /**
     * @param {import('../../base/exchange').BaseOptions} options User defined options for in http client lib
     */
    constructor(options) {
        const assignedOptions = mergeObjects(BINANCE_DEFAULT_OPTIONS, options);
        super(assignedOptions);

        this[keysSymbol] = null;

        Object.defineProperty(this, keysSymbol, {
            value: null,
        });
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
     *
     * @param {Error} err
     * @private
     */
    handleFetcherError(err) {
        if (err instanceof HTTPError) {
            throw new BinanceApiError(err);
        }

        throw err;
    }
}

module.exports = BinanceBase;
