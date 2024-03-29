const { HTTPError } = require('got');
const mergeObjects = require('deepmerge');

const ExchangeBase = require('../../base/exchange');
const BitglobalApiError = require('./errors/api.error');
const BitglobalCache = require('./etc/cache');
const ZenfuseUserError = require('../../base/errors/user.error');
const { createHmac } = require('crypto');

/**
 * Bitglobal base class for method which included in any wallet type
 */
class BitglobalBase extends ExchangeBase {
    /**
     * Http client options specially for Bitglobal
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
            prefixUrl: 'wss://global-api.bitglobal.pro',
        },
    };

    /**
     * @type {BitglobalCache}
     */
    cache;

    /**
     * @param {import('../../base/exchange').BaseOptions} options User defined options for in http client lib
     */
    constructor(options) {
        const assignedOptions = mergeObjects(
            BitglobalBase.DEFAULT_OPTIONS,
            options,
        );
        super(assignedOptions);

        this.cache = new BitglobalCache(this);
        this.msgNo = 0;
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

        const timestamp = Date.now();

        let sigParams = mergeObjects(options.json, {
            apiKey: this.keys.publicKey,
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

        const signature = this.createHmacSignatureBitglobal(
            sigParams,
            this.keys.secretKey,
            this.signatureEncoding,
        );

        const reqBody = mergeObjects(sigParams, {
            signature: signature,
        });

        options.json = reqBody;

        this.msgNo += 1;

        return await this.fetcher(url, options)
            .then(this.handleUnexpectedResponse)
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
     * Ping bitglobal servers
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
            throw new ZenfuseUserError(null, 'NOT_AUTHENTICATED');
        }
    }

    /**
     * @param {Error} err
     * @private
     */
    handleFetcherError(err) {
        if (err instanceof HTTPError) {
            throw new BitglobalApiError(err);
        }

        throw err;
    }

    handleUnexpectedResponse(response) {
        if (parseFloat(response.code) > 0) {
            throw new BitglobalApiError(response);
        }

        return response;
    }

    createHmacSignatureBitglobal(sigParams, secretKey, encoding) {
        const charsToDel = ['{', '}', '"'];

        let signaturePayload = JSON.stringify(sigParams)
            .slice(1, -1)
            .split(',')
            .join('&')
            .split(':')
            .join('=');

        charsToDel.forEach((item) => {
            signaturePayload = signaturePayload.split(item).join('');
        });

        return createHmac('sha256', secretKey)
            .update(signaturePayload)
            .digest(encoding);
    }

    /**
     * @typedef {import('../../../../base/schemas/orderParams').ZenfuseOrderParams} OrderParams
     */

    /**
     * Zenfuse -> Bitglobal
     *
     * @param {OrderParams} zOrder
     * @returns {object} Order for bitglobal api
     */
    transformZenfuseOrder(zOrder) {
        const TRANSFORM_LIST = ['side', 'type', 'price', 'quantity', 'symbol'];

        const bOrder = {
            symbol: zOrder.symbol.replace('/', '-'),
            type: zOrder.type,
            side: zOrder.side,
            quantity: zOrder.quantity.toString(),
            timestamp: Date.now().toString(),
        };

        if (zOrder.price) {
            bOrder.price = zOrder.price.toString();
        }

        if (zOrder.type === 'market') {
            bOrder.price = '-1';
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
     * Bitglobal -> Zenfuse
     *
     * @param {*} bOrder Order from Bitglobal REST
     * @param {object} zInitialOrder
     * @returns {PlacedOrder} Zenfuse Order
     */
    transformBitglobalOrder(bOrder, zInitialOrder = {}) {
        /**
         * @type {PlacedOrder}
         */
        const zOrder = {};

        // TODO: Refactor this

        zOrder.id = bOrder.data.orderId;
        if (Object.entries(zInitialOrder).length === 0) {
            //if order is not cached
            if (bOrder.data.status === 'success') {
                zOrder.status = 'close';
            } else if (
                bOrder.data.status === 'send' ||
                bOrder.data.status === 'pending'
            ) {
                zOrder.status = 'open';
            } else {
                zOrder.status = 'canceled';
            }
            zOrder.symbol = bOrder.data.symbol.replace('-', '/');
            zOrder.timestamp = bOrder.timestamp;
            zOrder.type = bOrder.data.type;
            zOrder.side = bOrder.data.side;
            zOrder.price = bOrder.data.price
                ? parseFloat(bOrder.data.price)
                : undefined;
            zOrder.quantity = parseFloat(bOrder.data.quantity);
        } else {
            zOrder.symbol = zInitialOrder.symbol;
            zOrder.timestamp = zInitialOrder.timestamp
                ? zInitialOrder.timestamp
                : Date.now();
            zOrder.type = zInitialOrder.type;
            zOrder.side = zInitialOrder.side;
            zOrder.quantity = zInitialOrder.quantity;
            zOrder.price = zInitialOrder.price
                ? zInitialOrder.price
                : undefined;
            zOrder.status = zInitialOrder.status
                ? zInitialOrder.status
                : 'open';
        }
        // zOrder.trades = bOrder.fills; // TODO: Fill commission counter

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
        const marketPrecisionInfo = this.cache.globalCache.get(
            'marketsPrecisionInfo',
        );

        if (!marketPrecisionInfo.has(zOrder.symbol)) {
            // TODO: Make some
            return zOrder;
        }

        const { quantityPrecision, pricePrecision } = marketPrecisionInfo.get(
            zOrder.symbol,
        );

        return super.preciseOrderValues(zOrder, {
            price: pricePrecision,
            quantity: quantityPrecision,
        });
    }
}

module.exports = BitglobalBase;
