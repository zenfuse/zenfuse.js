const { HTTPError } = require('got');
const mergeObjects = require('deepmerge');
const { createHmac } = require('crypto');

const ExchangeBase = require("../../base/exchange");
const BiboxCache = require("./etc/cache");

const BiboxApiError = require("./errors/api.error");
const UserError = require('../../base/errors/user.error');

const keysSymbol = Symbol('keys');

/**
 * Bibox base class for method which included in any wallet type
 *
 * **DEV:** Any class what extends ExchangeBase should have same public interface
 */
class BiboxBase extends ExchangeBase {
        /**
     * Http client options specially for Bibox
     *
     * @type {import('../../base/exchange').BaseOptions}
     */
    static DEFAULT_OPTIONS = {
        httpClientOptions: {
            responseType: 'json',
            prefixUrl: 'https://api.bibox.com/',
            headers: {
                'Content-Type': 'application/json',
            },
        },
        wsClientOptions: {
            prefixUrl: 'wss://push.bibox.com',
        },
    };

    /**
     * @type {BiboxCache}
     */
     cache;

     /**
      * @param {import('../../base/exchange').BaseOptions} options User defined options for in http client lib
      */
     constructor(options) {
         const assignedOptions = mergeObjects(
             BiboxBase.DEFAULT_OPTIONS,
             options,
         );
         super(assignedOptions);
 
         this[keysSymbol] = {};
 
         this.cache = new BiboxCache(this);
 
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
        
        const timestamp = Date.now();
        const signature = createHmac(
            "md5", 
            this[keysSymbol].privateKey
        )
            .update(timestamp.toString() + JSON.stringify(options.searchParams))
            .digest(this.signatureEncoding);

        options = mergeObjects(options, {
            headers: {
                'bibox-api-key': this[keysSymbol].publicKey,
                'bibox-api-sign': signature,
                'bibox-timestamp': timestamp
            },
            json: options.searchParams
        });

        return await this.fetcher(url, options).catch(this.handleFetcherError);
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
     * Ping Bibox servers
     *
     * @public
     */
    async ping() {
        return await this.publicFetch('v3/mdata/ping');
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
            throw new BiboxApiError(err);
        }

        throw err;
    }

      /**
     * @typedef {import('../../../../base/schemas/orderParams').ZenfuseOrderParams} OrderParams
     */

    /**
     * Zenfuse -> Bibox
     *
     * @param {OrderParams} zOrder Zenfuse order
     * @returns {object} Order for Bibox API
     */
    transformZenfuseOrder(zOrder) {
        // TODO: extra keys
        const bOrder = {};

        bOrder.pair = zOrder.symbol.replace('/', '_').toUpperCase();

        if (zOrder.type) {
            bOrder.order_type = zOrder.type == "market" ? 1 : 2;
        }

        if (zOrder.side) {
            bOrder.order_side = zOrder.side == "buy" ? 1 : 2;
        }

        if (zOrder.price) {
            bOrder.price = zOrder.price;
        }

        if (zOrder.quantity) {
            bOrder.amount = zOrder.quantity;
        }

        return bOrder;
    }

    /**
     * @typedef {import('../../../../base/schemas/openOrder').PlacedOrder} PlacedOrder
     */

    /**
     * Bibox -> Zenfuse
     *
     * @param {*} bOrder Order from Bibox
     * @returns {PlacedOrder} Zenfuse Order
     */
    transformBiboxOrder(bOrder) {
        /**
         * @type {PlacedOrder}
         */
        const zOrder = {};

        zOrder.id = bOrder.id;
        zOrder.symbol = bOrder.pair.replace('_', '/');
        zOrder.timestamp = bOrder.createdAt;
        zOrder.type = bOrder.order_type === 1 ? "market" : "limit";
        zOrder.side = bOrder.order_side === 1 ? "buy" : "sell";
        zOrder.price = parseFloat(bOrder.price);
        zOrder.quantity = parseFloat(bOrder.amount);

        switch (bOrder.status) {
            case 0: case 1: case 2: case 4:
                zOrder.status = 'open';
                break;
            case 3:
                zOrder.status = 'closed';
                break;
            default:
                zOrder.status = 'canceled';
        }

        return zOrder;
    }
}

module.exports = BiboxBase;