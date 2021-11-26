const { HTTPError } = require('got');

const ExchangeBase = require('../../base/exchange');
const NotAuathenticatedError = require('../../base/errors/notAuthenticated.error');
const BinanceApiError = require('./errors/api.error');
const { createHmacSignature } = require('./functions');

/**
 * Http client options specialy for Binance
 * @type {import('got').ExtendOptions}
 */
const BINANCE_HTTP_CLIENT_OPTIONS = {
    prefixUrl: 'https://api.binance.com/',
    websocketUrl: 'wss://stream.binance.com:9443/',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
    },
};

/**
 * Binance base class for method whitch included in any wallet type
 * @important Any class what extends ExchangeBase should have same public interface
 */
class BinanceBase extends ExchangeBase {
    _keys = null;

    /**
     * @param {import('got').ExtendOptions} httpClientOptions User defined options for in http client lib
     */
    constructor(httpClientOptions) {
        const options = Object.assign(
            BINANCE_HTTP_CLIENT_OPTIONS,
            httpClientOptions,
        );
        super(options);
    }

    /**
     * Make http request based on constructor settings
     *
     * @param {URL} url
     * @param {import('http').RequestOptions} options
     * @returns {object};
     */
    publicFetch(url, options = {}) {
        if (this._keys) {
            options = Object.assign(options, {
                headers: {
                    'X-MBX-APIKEY': this._keys.publicKey,
                },
            });
        }

        return this.fetcher(url, options).catch(this._handleFetcherError);
    }

    /**
     * Make authenticated http request based on constructor settings
     *
     * @param {URL} url
     * @param {import('http').RequestOptions} options
     * @returns {object};
     */
    privateFetch(url, options = {}) {
        this._checkInstanceHasKeys();

        if (!options.searchParams) options.searchParams = {};

        options.searchParams.timestamp = Date.now();

        options.searchParams.signature = createHmacSignature(
            options.searchParams,
            this._keys.privateKey,
        );

        options = Object.assign(options, {
            headers: {
                'X-MBX-APIKEY': this._keys.publicKey,
            },
        });

        return this.fetcher(url, options).catch(this._handleFetcherError);
    }

    /**
     * Connect to authentificated API
     *
     * @param {object} keys
     * @param {string} keys.publicKey
     * @param {string} keys.privateKey Same as secret key
     * @returns {this}
     */
    auth(keys) {
        this._keys = {};
        this._keys.publicKey = keys.publicKey;
        this._keys.privateKey = keys.privateKey;
        return this;
    }

    /**
     * Ping binance servers
     */
    async ping() {
        return await this.publicFetch('api/v3/ping');
    }

    /**
     * @private
     */
    _checkInstanceHasKeys() {
        if (this._keys === null) {
            throw new NotAuathenticatedError();
        }
    }

    /**
     *
     * @param {Error} err
     * @private
     */
    async _handleFetcherError(err) {
        if (err instanceof HTTPError) {
            throw new BinanceApiError(err);
        }

        throw err;
    }
}

module.exports = BinanceBase;
