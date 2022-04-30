const { HTTPError } = require('got');
const mergeObjects = require('deepmerge');

const ExchangeBase = require('../../base/exchange');
const OkxApiError = require('./errors/api.error');
const OkxCache = require('./etc/cache');
const { createHmacSignatureDefault } = require('../../base/utils/utils');
const UserError = require('../../base/errors/user.error');

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

        const timestamp = new Date().toISOString();

        let query = '';

        if (options.searchParams) {
            query = '?' + new URLSearchParams(options.searchParams).toString();
        }

        const sigParams = {
            ts: timestamp,
            method: options.method || 'GET',
            path: `/${url}${query}`,
            body: options.json,
        };

        const signature = createHmacSignatureDefault(
            sigParams,
            this[keysSymbol].privateKey,
            this.signatureEncoding,
        );

        options = mergeObjects(options, {
            headers: {
                'OK-ACCESS-KEY': this[keysSymbol].publicKey,
                'OK-ACCESS-TIMESTAMP': timestamp,
                'OK-ACCESS-SIGN': signature,
                'OK-ACCESS-PASSPHRASE': this[keysSymbol].addKey,
            },
        });

        return await this.fetcher(url, options)
            .then(this.handleUnexpectedResponse)
            .catch(this.handleFetcherError);
    }

    /**
     * Connect to authentificated API
     *
     * @param {object} keys
     * @param {string} keys.publicKey
     * @param {string} keys.privateKey Same as secret key
     * @param {string} keys.addKey OKX passphrase
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
            throw new UserError(null, 'NOT_AUTHENTICATED');
        }
    }

    /**
     * @param {Error} err
     * @private
     */
    handleFetcherError(err) {
        if (err instanceof HTTPError && err.response.body.msg) {
            throw new OkxApiError(err);
        }

        throw err;
    }

    handleUnexpectedResponse(body) {
        if (parseFloat(body.code) > 0) {
            throw new OkxApiError(null, body);
        }

        return body;
    }

    /**
     * @typedef {import('../../../../base/schemas/orderParams').ZenfuseOrderParams} OrderParams
     */

    /**
     * Zenfuse -> OKX
     *
     * @param {OrderParams} zOrder Order from
     * @returns {object} Order for okx api
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

        const xOrder = {
            instId: zOrder.symbol.replace('/', '-'),
            ordId: zOrder.id ? zOrder.id.toString() : undefined,
            ordType: zOrder.type,
            side: zOrder.side,
            sz: zOrder.quantity.toString(),
            tdMode: 'cash',
        };

        if (zOrder.price) {
            xOrder.px = zOrder.price.toString();
        }

        if (zOrder.type === 'market') {
            xOrder.px = null;
        }

        // Allow user extra keys
        for (const [key, value] of Object.entries(zOrder)) {
            if (!TRANSFORM_LIST.includes(key)) {
                xOrder[key] = value;
            }
        }

        return xOrder;
    }

    /**
     * @typedef {import('../../../../base/schemas/openOrder').PlacedOrder} PlacedOrder
     */

    /**
     * OKX -> Zenfuse
     *
     * @param {*} xOrder Order from OKX
     * @returns {PlacedOrder} Zenfuse placed Order
     */
    transformOkxOrder(xOrder) {
        /**
         * @type {PlacedOrder}
         */
        const zOrder = {};

        zOrder.id = xOrder.ordId;

        zOrder.timestamp = parseFloat(xOrder.cTime);
        zOrder.symbol = xOrder.instId.replace('-', '/');
        zOrder.type = xOrder.ordType;
        zOrder.side = xOrder.side;
        zOrder.quantity = parseFloat(xOrder.sz);

        if (xOrder.px) {
            zOrder.price = parseFloat(xOrder.px);
        }

        switch (xOrder.state) {
            case 'live':
            case 'partially_filled':
                zOrder.status = 'open';
                break;
            case 'filled':
                zOrder.status = 'close';
                break;
            default:
                zOrder.status = xOrder.state;
        }

        return zOrder;
    }
}

module.exports = OkxBase;
