const BithumbBase = require('../base');
const mergeObjects = require('deepmerge');

const utils = require('../../../base/utils/utils');

const AccountDataStream = require('../streams/accountDataStream');
const MarketDataStream = require('../streams/marketDataStream');
const { timeIntervals } = require('../metadata');

/**
 * @typedef {import('../../../base/exchange').BaseOptions} BaseOptions
 */

/**
 * Bithumb class for spot wallet API
 *
 */
class BithumbSpot extends BithumbBase {
    static DEFAULT_OPTIONS = {
        defaults: {
            limit: {},
            market: {},
        },
    };

    /**
     * @param {BaseOptions} options
     */
    constructor(options = {}) {
        const fullOptions = mergeObjects(BithumbSpot.DEFAULT_OPTIONS, options);
        super(fullOptions);
    }

    /**
     * @returns {string[]} Array of tickers on this exchange
     */
    async fetchTickers() {
        const markets = await this.publicFetch('spot/ticker', {
            searchParams: {
                symbol: 'ALL',
            },
        });
        // TODO: Cache update here

        const tickers = markets.data.map((ticker) => ticker.s);

        utils.linkOriginalPayload(tickers, markets);

        return tickers;
    }

    /**
     * @returns {string[]} Array of ticker pairs on Bithumb
     */
    async fetchMarkets() {
        const response = await this.publicFetch('spot/ticker', {
            searchParams: {
                symbol: 'ALL',
            },
        });

        // TODO: Cache update here

        const markets = response.data.map((m) => {
            let ticker = m.s.split('-');
            return {
                symbol: m.s,
                baseTicker: ticker[0],
                quoteTicker: ticker[1],
            };
        });

        utils.linkOriginalPayload(markets, response);

        return markets;
    }

    /**
     * @typedef {object} PriceObject
     * @property {string} symbol
     * @property {number} price
     */

    /**
     * **NOTE:** If the symbol is not sent, prices for all symbols will be returned in an array.
     *
     * @param {string} market Ticker pair aka symbol
     * @returns {PriceObject} Last price
     */
    async fetchPrice(market = '') {
        const requestPath = 'spot/ticker';

        const response = await this.publicFetch(requestPath, {
            searchParams: {
                symbol: market ? market.replace('/', '-') : 'ALL',
            },
        });

        if (market) {
            const price = {
                symbol: market,
                price: parseFloat(response.data[0].c),
            };

            utils.linkOriginalPayload(price, response);

            return price;
        }

        const prices = response.data.map((market) => {
            return {
                symbol: market.s.replace('-', '/'),
                price: parseFloat(market.c) || 0,
            };
        });

        utils.linkOriginalPayload(prices, response);

        return prices;
    }

    /**
     * @typedef {import('../utils/functions/transformation').Order} Order
     */

    /**
     * Create new spot order on Bithumb
     *
     * @param {Order} zOrder Order to create
     * @returns {Order} zCreatedOrder
     */
    async createOrder(zOrder) {
        this.validateOrderParams(zOrder);

        const bOrder = this.transformZenfuseOrder(zOrder);

        if (zOrder.type === 'market' && zOrder.side === 'buy') {
            let orderTotal = null;

            const { price } = await this.fetchPrice(zOrder.symbol);

            orderTotal = price * zOrder.quantity;

            bOrder.quantity = orderTotal.toString();
        }

        const bCreatedOrder = await this.privateFetch('spot/placeOrder', {
            method: 'POST',
            json: bOrder,
        });

        const zCreatedOrder = this.transformBithumbOrder(bCreatedOrder, zOrder);

        this.cache.cacheOrder(zCreatedOrder);

        utils.linkOriginalPayload(zCreatedOrder, bCreatedOrder);

        return zCreatedOrder;
    }

    /**
     * Cancel an active order
     *
     * @param {Order} zOrder Active order to cancel
     */
    async cancelOrder(zOrder) {
        const response = await this.privateFetch('spot/cancelOrder', {
            method: 'POST',
            json: {
                orderId: zOrder.id,
                symbol: zOrder.symbol.replace('/', '-'),
            },
        });

        zOrder.status = 'canceled';

        this.cache.deleteCachedOrderById(zOrder.id);

        utils.linkOriginalPayload(zOrder, response);

        return zOrder;
    }

    /**
     * Cancel an active order
     *
     * @param {string} orderId Bithumb order id
     * @param {string} symbol
     */
    async cancelOrderById(orderId, symbol = '') {
        let orderToDelete = this.cache.getCachedOrderById(orderId);

        if (orderToDelete) {
            symbol = orderToDelete.symbol.replace('/', '-');
        }

        const response = await this.privateFetch('spot/cancelOrder', {
            method: 'POST',
            json: {
                orderId: orderId,
                symbol: symbol, //empty string for master.test
            },
        });

        if (!orderToDelete) {
            orderToDelete = this.fetchOrderById(orderId, symbol);
        }

        this.cache.deleteCachedOrderById(orderId);

        utils.linkOriginalPayload(orderToDelete, response);

        return orderToDelete;
    }

    // TODO: Test for this
    async fetchOpenOrders() {
        throw 'Not implemented';
    }

    // TODO: add coinType if necessary
    async fetchBalances() {
        const response = await this.privateFetch('spot/assetList', {
            method: 'POST',
            json: {
                assetType: 'spot',
                // coinType: 'BTC',
            },
        });

        const balances = response.data
            .filter((b) => parseFloat(b.count) > 0)
            .map((b) => {
                return {
                    ticker: b.coinType,
                    free: parseFloat(b.count),
                    used: parseFloat(b.frozen),
                };
            });

        utils.linkOriginalPayload(balances, response);

        return balances;
    }

    /**
     *
     * @param {string} orderId
     * @param {string} symbol
     */
    async fetchOrderById(orderId, symbol = '') {
        let orderToFetch = this.cache.getCachedOrderById(orderId);

        if (orderToFetch) {
            symbol = orderToFetch.symbol.replace('/', '-');
        }

        const responce = await this.privateFetch('spot/singleOrder', {
            method: 'POST',
            json: {
                orderId: orderId,
                symbol: symbol, //empty string for master.test
            },
        });

        const zOrder = this.transformBithumbOrder(responce, orderToFetch);

        return zOrder;
    }

    /**
     * @typedef {import('../../../base/schemas/kline.js').ZenfuseKline} Kline
     */

    /**
     * **NOTE:** Not stable
     *
     * @see https://github.com/bithumb-pro/bithumb.pro-official-api-docs/issues/78
     * @see https://github.com/bithumb-pro/bithumb.pro-official-api-docs/issues/67
     * @param {object} params
     * @param {string} params.symbol
     * @param {timeIntervals} params.interval
     * @param {number} [params.startTime]
     * @param {number} [params.endTime]
     * @returns {Kline[]}
     */
    async fetchCandleHistory(params) {
        // NOTE: `start` and `end` should be in secconds
        let start = 0;
        let end = 0;

        // TODO: Timeline defaults for 1m and 1M
        if (!params.startTime || !params.endTime) {
            end = new Date().setMinutes(0, 0, 0) / 1000;
            start = end - 60 * 60; // Last hour didnt work
        } else {
            start = Math.floor(params.startTime / 1000);
            end = Math.floor(params.endTime / 1000);
        }

        const response = await this.publicFetch('spot/kline', {
            searchParams: {
                symbol: params.symbol.replace('/', '-'),
                type: timeIntervals[params.interval],
                start,
                end,
            },
        }).catch((e) => {
            e;
        });

        const result = response.data.map((bKline) => {
            const kline = {
                open: parseFloat(bKline.o),
                high: parseFloat(bKline.h),
                low: parseFloat(bKline.l),
                close: parseFloat(bKline.c),
                timestamp: parseFloat(bKline.time) * 1000,
                interval: params.interval,
                symbol: params.symbol,
                volume: parseFloat(bKline.v),
            };
            utils.linkOriginalPayload(kline, bKline);
            return kline;
        });

        utils.linkOriginalPayload(result, response);

        return result;
    }

    /**
     * @typedef {import('../../../../base/schemas/orderParams').ZenfuseOrderParams} OrderParams
     */

    /**
     * Zenfuse -> Bithumb
     *
     * @param {OrderParams} zOrder
     * @returns {object} Order for bithumb api
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
     * Bithumb -> Zenfuse
     *
     * @param {*} bOrder Order from Bithumb REST
     * @param {object} zInitialOrder
     * @returns {PlacedOrder} Zenfuse Order
     */
    transformBithumbOrder(bOrder, zInitialOrder = {}) {
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
        // zOrder.trades = bOrder.fills; // TODO: Fill commision counter

        return zOrder;
    }

    getAccountDataStream() {
        return new AccountDataStream(this);
    }

    getMarketDataStream() {
        return new MarketDataStream(this);
    }
}

module.exports = BithumbSpot;
