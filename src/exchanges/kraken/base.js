const { HTTPError } = require('got');
const mergeObjects = require('deepmerge');
const qs = require('qs');

const ExchangeBase = require('../../base/exchange');
const KrakenApiException = require('./errors/api.error');
const KrakenCache = require('./etc/cache');
const UserError = require('../../base/errors/user.error');
const RuntimeError = require('../../base/errors/runtime.error');
const { createHmac, createHash } = require('crypto');

const keysSymbol = Symbol.for('zenfuse.keyVault');

/**
 * Kraken base class for method which included in any wallet type
 *
 * **DEV:** Any class what extends ExchangeBase should have same public interface
 */
class KrakenBase extends ExchangeBase {
    /**
     * Http client options specially for Kraken
     *
     * @type {import('../../base/exchange').BaseOptions}
     */
    static DEFAULT_OPTIONS = {
        httpClientOptions: {
            responseType: 'json',
            prefixUrl: 'https://api.kraken.com/',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        },
        wsClientOptions: {
            prefixUrl: 'wss://ws-auth.kraken.com',
        },
    };

    /**
     * @type {KrakenCache}
     */
    cache;

    /**
     * @param {import('../../base/exchange').BaseOptions} options User defined options for in http client lib
     */
    constructor(options) {
        const assignedOptions = mergeObjects(
            KrakenBase.DEFAULT_OPTIONS,
            options,
        );
        super(assignedOptions);

        this[keysSymbol] = {};

        this.cache = new KrakenCache(this);
        this.signatureEncoding = 'base64';
    }

    /**
     * Make http request based on constructor settings
     *
     * @param {URL} url
     * @param {import('http').RequestOptions} options
     * @returns {object};
     */
    async publicFetch(url, options = {}) {
        return await this.fetcher(url, options)
            .then(this.handleUnexpectedResponse)
            .catch(this.handleFetcherError);
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

        const signature = this.createHmacSignatureKraken(
            url,
            options.json,
            this[keysSymbol].privateKey,
        );

        options = mergeObjects(options, {
            headers: {
                'API-KEY': this[keysSymbol].publicKey,
                'API-SIGN': signature,
            },
        });

        return await this.fetcher(url, options)
            .then(this.handleUnexpectedResponse)
            .catch(this.handleFetcherError);
    }

    /**
     * Connect to authenticated API
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
     * Is instance has keys to authenticate on not
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
     * Ping Kraken servers
     *
     * @public
     */
    async ping() {
        await this.publicFetch('0/public/Time');
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
        if (err instanceof HTTPError && err.response.body.msg) {
            throw new KrakenApiException(err);
        }

        throw err;
    }

    handleUnexpectedResponse(body) {
        if (parseFloat(body.code) > 0) {
            throw new KrakenApiException(null, body);
        }

        return body;
    }

    createHmacSignatureKraken(url, body, privateKey) {
        const nonce = Date.now().toString();

        body = qs.stringify(body);

        const secretBuf = Buffer.from(privateKey, this.signatureEncoding);

        const hmac = new createHmac('sha512', secretBuf);

        const hash = new createHash('sha256')
            .update(nonce + body)
            .digest('binary');

        return hmac.update(url + hash, 'binary').digest(this.signatureEncoding);
    }

    /**
     * Parses Kraken symbol using cache
     *
     * @param {string} kSymbol Kraken symbol without separator
     * @returns {string} Normal symbol with separator
     */
    parseKrakenSymbol(kSymbol) {
        const isSymbolCached = this.cache.parsedSymbols?.get(kSymbol);

        let rawSymbol = '';

        if (!isSymbolCached) {
            const errorMsg = `Unable to parse binance ${kSymbol} symbol`;

            // 6 length symbol can divided by 2 pieces
            if (kSymbol.length === 6) {
                const base = kSymbol.slice(0, 3);
                const quote = kSymbol.slice(3);
                rawSymbol = [base, quote];
                process.emitWarning(errorMsg, {
                    code: 'ZEFU_CACHE_UNSYNC',
                    detail: `Zenfuse cannot find a symbol in the global cache. This is a warning because this symbol possible to guess.`,
                });
                return rawSymbol.join('/');
            } else {
                throw new RuntimeError(errorMsg, 'ZEFU_CACHE_UNSYNC');
            }
        }

        rawSymbol = this.cache.parsedSymbols.get(kSymbol);

        return rawSymbol.join('/');
    }

    /**
     * @typedef {import('../../../../base/schemas/orderParams').ZenfuseOrderParams} OrderParams
     */

    /**
     * Zenfuse -> Kraken
     *
     * @param {OrderParams} zOrder Order from
     * @returns {object} Order for Kraken api
     */
    transformZenfuseOrder(zOrder) {
        const TRANSFORM_LIST = [
            'id',
            'side',
            'type',
            'price',
            'quantity',
            'symbol',
        ];

        const kOrder = {
            pair: zOrder.symbol.replace('/', ''),
            txId: zOrder.id ? zOrder.id.toString() : undefined,
            ordertype: zOrder.type,
            type: zOrder.side,
            volume: zOrder.quantity.toString(),
        };

        if (zOrder.price) {
            kOrder.price = zOrder.price.toString();
        }

        if (zOrder.type === 'market') {
            kOrder.price = null;
        }

        // Allow user extra keys
        for (const [key, value] of Object.entries(zOrder)) {
            if (!TRANSFORM_LIST.includes(key)) {
                kOrder[key] = value;
            }
        }

        return kOrder;
    }

    /**
     * @typedef {import('../../../../base/schemas/openOrder').PlacedOrder} PlacedOrder
     */

    /**
     * Kraken -> Zenfuse
     *
     * @param {*} kOrder Order from Kraken
     * @returns {PlacedOrder} Zenfuse placed Order
     */
    transformKrakenOrder(kOrder) {
        /**
         * @type {PlacedOrder}
         */
        const zOrder = {};

        zOrder.timestamp = parseFloat(kOrder.opentm);
        zOrder.symbol = kOrder.descr.pair.includes('/') ? kOrder.descr.pair : this.parseKrakenSymbol(kOrder.descr.pair);
        zOrder.type = kOrder.descr.ordertype;
        zOrder.side = kOrder.descr.type;
        zOrder.quantity = parseFloat(kOrder.vol);

        if (kOrder.descr.ordertype !== 'market') {
            zOrder.price = parseFloat(kOrder.descr.price);
        }

        switch (kOrder.status) {
            case 'pending':
                zOrder.status = 'open';
                break;
            case 'expired':
                zOrder.status = 'canceled';
                break;
            default:
                zOrder.status = kOrder.status;
        }

        return zOrder;
    }
}

module.exports = KrakenBase;
