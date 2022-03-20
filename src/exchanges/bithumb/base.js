const { HTTPError } = require('got');
const mergeObjects = require('deepmerge');

const ExchangeBase = require('../../base/exchange');
const NotAuathenticatedError = require('../../base/errors/notAuthenticated.error');
const BithumbApiError = require('./errors/api.error');
const BithumbCache = require('./etc/cache');
const { createHmacSignature } = require('./utils');

const keysSymbol = Symbol.for('zenfuse.keyVault');

/**
 * Bithumb base class for method which included in any wallet type
 *
 * @important Any class that extends ExchangeBase should have same public interface
 */
class BithumbBase extends ExchangeBase {
    /**
     * Http client options specially for Bithumb
     *
     * @type {import('../../base/exchange').BaseOptions}
     */
    static DEFAULT_OPTIONS = {
        httpClientOptions: {
            responseType: 'json',
            prefixUrl: 'https://global-openapi.bithumb.pro/openapi/v1',
            headers: {
                'Content-Type': 'application/json',
            },
        },
        wsClientOptions: {
            prefixUrl: 'wss://global-api.bithumb.pro',
        },
    };

    /**
     * @type {BithumbCache}
     */
    cache;

    /**
     * @param {import('../../base/exchange').BaseOptions} options User defined options for in http client lib
     */
    constructor(options) {
        const assignedOptions = mergeObjects(
            BithumbBase.DEFAULT_OPTIONS,
            options,
        );
        super(assignedOptions);

        this[keysSymbol] = {};

        this.cache = new BithumbCache(this);
        this.msgNo = 0;
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

        const timestamp = Date.now();

        let sigParams = mergeObjects(options.json, {
            apiKey: this[keysSymbol].publicKey,
            timestamp: timestamp.toString(),
            msgNo: this.msgNo.toString(),
        });

        sigParams = Object.keys(sigParams)
            .sort()
            .reduce(
                (acc, key) => ({
                    ...acc,
                    [key]: sigParams[key],
                }),
                {},
            );

        const signature = createHmacSignature(
            sigParams,
            this[keysSymbol].privateKey,
        );

        const reqBody = mergeObjects(sigParams, {
            signature: signature,
        });

        options.json = reqBody;

        // console.log(options);

        this.msgNo += 1;

        return await this.fetcher(url, options).then(
            this.handleFetcherResponse,
            this.handleFetcherError,
        );
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
     * Ping bithumb servers
     *
     * @public
     */
    async ping() {
        await this.publicFetch('serverTime');
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
            throw new BithumbApiError(err);
        }

        throw err;
    }

    handleFetcherResponse(response) {
        if (parseFloat(response.code) > 0) {
            throw new BithumbApiError(response);
        }

        return response;
    }
}

module.exports = BithumbBase;