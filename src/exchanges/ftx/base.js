const { HTTPError } = require('got');
const mergeObjects = require('deepmerge');

const ExchangeBase = require('../../base/exchange');
const FtxApiError = require('./errors/api.error');
const FtxCache = require('./etc/cache');
const UserError = require('../../base/errors/user.error');
const { createHmacSignatureDefault } = require('../../base/utils/utils');

const keysSymbol = Symbol.for('zenfuse.keyVault');

/**
 * FTX base class for method which included in any wallet type
 *
 * **DEV:** Any class what extends ExchangeBase should have same public interface
 */
class FtxBase extends ExchangeBase {
    /**
     * Http client options specialy for FTX
     *
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
        return await this.fetcher(url, options).catch(this.handleFetcherError);
        // TODO: FTX Response checker
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
            body: options.json,
        };

        const signature = createHmacSignatureDefault(
            sigParams,
            this[keysSymbol].privateKey,
            this.signatureEncoding,
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
     *
     * @public
     */
    async ping() {
        await this.publicFetch('api');
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
            throw new FtxApiError(err);
        }

        throw err;
    }

    /**
     * @typedef {import('../../../../base/schemas/orderParams').ZenfuseOrderParams} OrderParams
     */

    /**
     * Zenfuse -> FTX
     *
     * @param {OrderParams} zOrder Order from
     * @returns {object} Order for ftx api
     */
     transformZenfuseOrder(zOrder) {
        const TRANSFORM_LIST = ['side', 'type', 'price', 'quantity', 'symbol'];

        const fOrder = {
            market: zOrder.symbol,
            type: zOrder.type,
            side: zOrder.side,
            size: zOrder.quantity,
        };

        if (zOrder.price) {
            fOrder.price = zOrder.price;
        }

        if (zOrder.type === 'market') {
            fOrder.price = null;
        }

        // Allow user extra keys
        for (const [key, value] of Object.entries(zOrder)) {
            if (!TRANSFORM_LIST.includes(key)) {
                fOrder[key] = value;
            }
        }

        return fOrder;
    }

    /**
     * @typedef {import('../../../../base/schemas/openOrder').PlacedOrder} PlacedOrder
     */

    /**
     * FTX -> Zenfuse
     *
     * @param {*} fOrder Order from FTX
     * @returns {PlacedOrder} Zenfuse Order
     */
    transformFtxOrder(fOrder) {
        /**
         * @type {PlacedOrder}
         */
        const zOrder = {};

        zOrder.id = fOrder.id.toString();
        zOrder.timestamp = Date.parse(fOrder.createdAt);
        zOrder.symbol = fOrder.market;
        zOrder.type = fOrder.type;
        zOrder.side = fOrder.side;
        zOrder.quantity = parseFloat(fOrder.size);
        zOrder.price = fOrder.price ? parseFloat(fOrder.price) : undefined;
        // zOrder.trades = bOrder.fills; // TODO: Fill commision counter

        if (fOrder.status === 'new') {
            zOrder.status = 'open';
        } else {
            zOrder.status = fOrder.status;
        }

        return zOrder;
    }
}

module.exports = FtxBase;
