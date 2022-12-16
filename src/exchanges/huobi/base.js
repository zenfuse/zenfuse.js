const { HTTPError } = require('got');
const mergeObjects = require('deepmerge');
const { createHmac } = require('crypto');

const ExchangeBase = require('../../base/exchange');
const HuobiApiError = require('./errors/api.error');
const HuobiCache = require('./etc/cache');
const ZenfuseRuntimeError = require('../../base/errors/runtime.error');
const UserError = require('../../base/errors/user.error');

/**
 * Huobi base class for method which included in any wallet type
 *
 * **DEV:** Any class what extends ExchangeBase should have same public interface
 */
class HuobiBase extends ExchangeBase {
    /**
     * Http client options specially for Huobi
     *
     * @type {import('../../base/exchange').BaseOptions}
     */
    static DEFAULT_OPTIONS = {
        httpClientOptions: {
            responseType: 'json',
            prefixUrl: 'https://api.huobi.pro/',
            headers: {
                'Content-Type': 'application/json',
            },
        },
        wsClientOptions: {
            prefixUrl: 'wss://api.huobi.pro/',
        },
    };

    /**
     * @type {HuobiCache}
     */
    cache;

    /**
     * @param {import('../../base/exchange').BaseOptions} options User defined options for in http client lib
     */
    constructor(options) {
        const assignedOptions = mergeObjects(
            HuobiBase.DEFAULT_OPTIONS,
            options,
        );
        super(assignedOptions);

        this.cache = new HuobiCache(this);
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
            .then(this.handleErrorResponse)
            .catch(this.handleFetcherError);
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

        const queryString = new URLSearchParams({
            AccessKeyId: this.keys.publicKey,
            SignatureMethod: 'HmacSHA256',
            SignatureVersion: 2,
            Timestamp: new Date().toISOString().replace(/.\d+Z$/g, ''), // Remove milliseconds
        });

        if (options.searchParams) {
            for (const [key, value] of Object.entries(options.searchParams)) {
                queryString.append(key, value);
            }
        }

        const method = options.method || this.fetcher.defaults.options.method;

        const signature = this.createHmacSignatureHuobi(
            method,
            url,
            queryString,
            this.keys.secretKey,
        );

        queryString.append('Signature', signature);

        options.searchParams = queryString;

        return await this.fetcher(url, options)
            .then(this.handleErrorResponse)
            .catch(this.handleFetcherError);
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
     * Ping Huobi servers
     *
     * @public
     */
    async ping() {
        return await this.publicFetch('v1/common/timestamp');
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
            throw new HuobiApiError(null, err);
        }

        throw err;
    }

    /**
     * @param {*} res
     * @private
     * @returns {*} Huobi success response
     */
    handleErrorResponse(res) {
        if (res.status === 'error') {
            throw new HuobiApiError(res);
        }

        return res;
    }

    createHmacSignatureHuobi(method, url, queryString, secretKey) {
        const preSignedText = `${method}\napi.huobi.pro\n/${url}\n${queryString.toString()}`;

        return createHmac('sha256', secretKey)
            .update(preSignedText)
            .digest('base64');
    }

    /**
     * Parses huobi symbol using cache
     *
     * @param {string} hSymbol Huobi symbol without separator
     * @returns {string} Normal symbol with separator
     */
    parseHuobiSymbol(hSymbol) {
        const isSymbolCached = this.cache.parsedSymbols.has(hSymbol);

        let rawSymbol = '';

        if (!isSymbolCached) {
            const errorMsg = `Unable to parse huobi ${hSymbol} symbol`;

            // 6 length symbol can devided by 2 pieces
            if (hSymbol.length === 6) {
                const base = hSymbol.slice(0, 3);
                const quote = hSymbol.slice(3);
                rawSymbol = [base, quote];
                process.emitWarning(errorMsg, {
                    code: 'ZEFU_CACHE_UNSYNC',
                    detail: `Zenfuse cannot find a symbol in the global cache. This is a warning because this symbol possible to guess.`,
                });
            } else {
                throw new ZenfuseRuntimeError(errorMsg, 'ZEFU_CACHE_UNSYNC');
            }
        }

        rawSymbol = this.cache.parsedSymbols.get(hSymbol);

        return rawSymbol.join('/');
    }

    /**
     * Validation function for {@link HuobiSpot.cancelOrder}
     *
     * @param {object} order order object to cancel
     * @param {string | number} order.id Id is required
     */
    validateOrderForCanceling(order) {
        if (order.id === undefined) {
            throw new Error('order id is required for canceling');
        }

        const orderIdType = typeof order.id;

        if (orderIdType !== 'string' && orderIdType !== 'number') {
            throw new TypeError(
                `Order id for canceling should be string or number, recieved ${orderIdType}`,
            );
        }
    }

    /**
     * Zenfuse -> Huobi
     *
     * **DEV:** Doesn't include required account id
     *
     * @param {Order} zOrder Zenfuse order
     * @returns {object} Order for binance api
     */
    transformZenfuseOrder(zOrder) {
        const TRANSFORM_LIST = ['side', 'type', 'price', 'quantity', 'symbol'];
        const hOrder = {};

        hOrder.symbol = zOrder.symbol.replace('/', '').toLowerCase();
        hOrder.amount = zOrder.quantity.toString().toLowerCase();

        if (zOrder.price) {
            hOrder.price = zOrder.price.toString().toLowerCase();
        }

        hOrder.source = 'spot-api';
        hOrder.type = `${zOrder.side}-${zOrder.type}`.toLowerCase();

        // Allow user extra keys
        for (const [key, value] of Object.entries(zOrder)) {
            if (!TRANSFORM_LIST.includes(key)) {
                hOrder[key] = value;
            }
        }

        return hOrder;
    }

    /**
     * Huobi -> Zenfuse
     *
     * @param {*} hOrder Order from Huobi
     * @returns {Order} Zenfuse Order
     */
    transformHuobiOrder(hOrder) {
        /**
         * @type {Order}
         */
        const zOrder = {};

        zOrder.id = hOrder.id.toString();
        zOrder.timestamp = hOrder['created-at'];

        switch (hOrder.state) {
            case 'created':
            case 'submitted':
            case 'partial-filled':
                zOrder.status = 'open';
                break;
            case 'filled':
                zOrder.status = 'close';
                break;
            default:
                zOrder.status = 'canceled';
                break;
        }

        zOrder.symbol = hOrder.symbol;

        const [side, type] = hOrder.type.split('-');

        zOrder.side = side;
        zOrder.type = type;
        zOrder.price = parseFloat(hOrder.price);
        zOrder.quantity = parseFloat(hOrder.amount);

        return zOrder;
    }
}

module.exports = HuobiBase;
