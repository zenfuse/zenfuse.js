const { HTTPError } = require('got');
const mergeObjects = require('deepmerge');
const { createHmac } = require('crypto');

const ExchangeBase = require('../../base/exchange');
const BybitApiError = require('./errors/api.error');
const BybitCache = require('./etc/cache');
const RuntimeError = require('../../base/errors/runtime.error');
const UserError = require('../../base/errors/user.error');

/**
 * Bybit base class for method which included in any wallet type
 *
 * **DEV:** Any class what extends ExchangeBase should have same public interface
 */
class BybitBase extends ExchangeBase {
    /**
     * Http client options specially for Bybit
     *
     * @type {import('../../base/exchange').BaseOptions}
     */
    static DEFAULT_OPTIONS = {
        httpClientOptions: {
            responseType: 'json',
            prefixUrl: 'https://api.bybit.com/',
        },
        wsClientOptions: {
            prefixUrl: 'wss://stream.bybit.com/v5/public/spot',
        },
    };
    /**
     * @type {BybitCache}
     */
    cache;

    /**
     * @param {import('../../base/exchange').BaseOptions} options User defined options for in http client lib
     */
    constructor(options) {
        const assignedOptions = mergeObjects(
            BybitBase.DEFAULT_OPTIONS,
            options,
        );
        super(assignedOptions);

        this.cache = new BybitCache(this);

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
        if (this.hasKeys) {
            options = mergeObjects(options, {
                headers: {
                    'X-BAPI-API-KEY': this.keys.publicKey,
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
        
        const timestamp = Date.now();
        const queryString = new URLSearchParams(options.searchParams).toString();
        const RECV_WINDOW = 5000;

        const sigString = `${timestamp}${this.keys.publicKey}${RECV_WINDOW}${queryString}`;

        const signature = createHmac(
            'sha256',
            this.keys.secretKey,
        )
            .update(sigString)
            .digest(this.signatureEncoding);

        options = mergeObjects(options, {
            headers: {
                'X-BAPI-API-KEY': this.keys.publicKey,
                'X-BAPI-TIMESTAMP': timestamp,
                'X-BAPI-RECV-WINDOW': RECV_WINDOW,
                'X-BAPI-SIGN': signature,
            },
        });

        return await this.fetcher(url, options).catch(this.handleFetcherError);
    }

    /**
     * Is instance has keys to authenticate on not
     *
     * @type {boolean}
     */
    get hasKeys() {
        return !!this.keys && !!this.keys.publicKey && !!this.keys.secretKey;
    }

    /**
     * Ping binance servers
     *
     * @public
     */
    async ping() {
        return await this.publicFetch('v3/public/time');
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
            throw new BybitApiError(err);
        }

        throw err;
    }

    /**
     * Parses Bybit symbol using cache
     *
     * @protected
     * @param {string} bSymbol Cursed Bybit symbol without separator
     * @returns {string} Normal symbol with separator
     */
    parseBybitSymbol(bSymbol) {
        const isSymbolCached = this.cache.parsedSymbols?.get(bSymbol);

        let rawSymbol = '';

        if (!isSymbolCached) {
            const errorMsg = `Unable to parse binance ${bSymbol} symbol`;

            // 6 length symbol can divided by 2 pieces
            if (bSymbol.length === 6) {
                const base = bSymbol.slice(0, 3);
                const quote = bSymbol.slice(3);
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

        rawSymbol = this.cache.parsedSymbols.get(bSymbol);

        return rawSymbol.join('/');
    }

    /**
     * @typedef {import('../../base/schemas/orderParams').ZenfuseOrderParams} OrderParams
     */

    /**
     * Zenfuse -> Bybit
     *
     * **DEV:** This function does not assign defaults values
     *
     * @param {OrderParams} zOrder Zenfuse order parameters
     * @returns {object} Order for binance api
     */
    transformZenfuseOrder(zOrder) {
        const TRANSFORM_LIST = [
            'side',
            'type',
            'price',
            'quantity',
            'symbol',
            'timeInForce',
        ];
        const bOrder = {};

        bOrder.symbol = zOrder.symbol.replace('/', '').toUpperCase();

        if (zOrder.type) {
            bOrder.type = zOrder.type.toUpperCase();
        }

        if (zOrder.side) {
            bOrder.side = zOrder.side.toUpperCase();
        }

        if (zOrder.price) {
            bOrder.price = zOrder.price.toString();
        }

        if (zOrder.quantity) {
            bOrder.quantity = zOrder.quantity.toString();
        }

        if (zOrder.timeInForce) {
            bOrder.timeInForce = zOrder.timeInForce.toUpperCase();
        }

        // Allow user extra keys
        for (const [key, value] of Object.entries(zOrder)) {
            if (!TRANSFORM_LIST.includes(key)) {
                bOrder[key] = value;
            }
        }

        return bOrder;
    }

    /**
     * @typedef {import('../../../../base/schemas/openOrder').PlacedOrder} PlacedOrder
     */

    /**
     * Bybit -> Zenfuse
     *
     * @param {*} bOrder Order from binance
     * @returns {PlacedOrder} Posted Zenfuse Order
     */
    transformBybitOrder(bOrder) {
        /**
         * @type {PlacedOrder}
         */
        const zOrder = {};

        zOrder.id = bOrder.orderId.toString();
        zOrder.timestamp = bOrder.transactTime || bOrder.time;
        zOrder.type = bOrder.type.toLowerCase();
        zOrder.side = bOrder.side.toLowerCase();
        zOrder.price = parseFloat(bOrder.price);
        zOrder.quantity = parseFloat(bOrder.origQty);

        switch (bOrder.status) {
            case 'NEW':
            case 'PARTIALLY_FILLED':
                zOrder.status = 'open';
                break;
            case 'FILLED':
                zOrder.status = 'closed';
                break;
            default:
                zOrder.status = 'canceled';
        }

        return zOrder;
    }

    /**
     * Order modifier for price and quantity. Provide decimal precision context for basic method.
     *
     * @protected
     * @param {OrderParams} zOrder
     * @returns {OrderParams}
     */
    preciseOrderValues(zOrder) {
        const { quantityPrecision, pricePrecision } = this.cache.globalCache
            .get('marketsPrecisionInfo')
            .get(zOrder.symbol);

        return super.preciseOrderValues(zOrder, {
            price: pricePrecision,
            quantity: quantityPrecision,
        });
    }
}

module.exports = BybitBase;
