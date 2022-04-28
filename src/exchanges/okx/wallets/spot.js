const OkxBase = require('../base');
const mergeObjects = require('deepmerge');

const utils = require('../../../base/utils/utils');

const AccountDataStream = require('../streams/accountDataStream');
const MarketDataStream = require('../streams/marketDataStream');
const ZenfuseRuntimeError = require('../../../base/errors/runtime.error');

/**
 * @typedef {import('../../../base/exchange').BaseOptions} BaseOptions
 */

/**
 * OKX class for spot wallet API
 */
class OkxSpot extends OkxBase {
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
        const fullOptions = mergeObjects(OkxSpot.DEFAULT_OPTIONS, options);
        super(fullOptions);
    }

    /**
     * @returns {string[]} Array of tickers on this exchange
     */
    async fetchTickers() {
        const markets = await this.publicFetch('api/v5/market/tickers', {
            searchParams: {
                instType: 'SPOT',
            },
        });

        const tickers = markets.data.map((ticker) => ticker.instId);

        utils.linkOriginalPayload(tickers, markets);

        return tickers;
    }

    /**
     * @returns {string[]} Array of ticker pairs on OKX
     */
    async fetchMarkets() {
        const response = await this.publicFetch('api/v5/market/tickers', {
            searchParams: {
                instType: 'SPOT',
            },
        });

        const markets = response.data.map((m) => {
            const [baseTicker, quoteTicker] = m.instId.split('-');
            return {
                symbol: m.instId,
                baseTicker,
                quoteTicker,
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
        if (market) {
            const symbol = market.replace('/', '-');

            const response = await this.publicFetch('api/v5/market/ticker', {
                searchParams: {
                    instId: symbol,
                },
            });

            const price = {
                symbol: market,
                price: parseFloat(response.data[0].last),
            };

            utils.linkOriginalPayload(price, response);

            return price;
        }

        const response = await this.publicFetch('api/v5/market/tickers', {
            searchParams: {
                instType: 'SPOT',
            },
        });

        const prices = response.data.map((m) => {
            return {
                symbol: m.instId.replace('-', '/'),
                price: parseFloat(m.last) || 0,
            };
        });

        utils.linkOriginalPayload(prices, response);

        return prices;
    }

    /**
     * @typedef {import('../../../base/schemas/kline.js').ZenfuseKline} Kline
     * @typedef {import('../metadata').timeIntervals} timeIntervals
     */

    /**
     * @param {object} params
     * @param {string} params.symbol
     * @param {timeIntervals} params.interval
     * @param {number} [params.startTime]
     * @param {number} [params.endTime]
     * @returns {Promise<Kline[]>}
     */
    async fetchCandleHistory(params) {
        this.validateCandleHistoryParams(params);

        const response = await this.publicFetch(
            'api/v5/market/history-candles',
            {
                searchParams: {
                    instId: params.symbol.replace('/', '-'),
                    bar: params.interval,
                    before: params.startTime,
                    after: params.endTime,
                },
            },
        );

        const result = response.data.map((oCandle) => {
            oCandle = oCandle.map(Number);

            const zCandle = {
                timestamp: new Date(oCandle[0]).getTime(),
                open: oCandle[1],
                high: oCandle[2],
                low: oCandle[3],
                close: oCandle[4],
                volume: oCandle[5],
                interval: params.interval,
                symbol: params.symbol,
            };

            utils.linkOriginalPayload(zCandle, oCandle);

            return zCandle;
        });

        utils.linkOriginalPayload(result, response);

        return result;
    }

    /**
     * @typedef {import('../utils/functions/transformation').Order} Order
     */

    /**
     * Create new spot order on OKX
     *
     * @param {Order} zOrder Order to create
     */
    async createOrder(zOrder) {
        this.validateOrderParams(zOrder);

        const xOrder = this.transformZenfuseOrder(zOrder);

        if (zOrder.type === 'market' && zOrder.side === 'buy') {
            let orderTotal = null;

            const { price } = await this.fetchPrice(zOrder.symbol);

            orderTotal = price * zOrder.quantity;

            xOrder.sz = orderTotal.toString();
        }

        const response = await this.privateFetch('api/v5/trade/order', {
            method: 'POST',
            json: xOrder,
        });

        const xCreatedOrder = response.data[0];

        const zCreatedOrder = Object.assign({}, zOrder);

        zCreatedOrder.id = xCreatedOrder.ordId;
        zCreatedOrder.status = 'open';
        zCreatedOrder.timestamp = Date.now();

        this.cache.cacheOrder(zCreatedOrder);

        utils.linkOriginalPayload(zCreatedOrder, xCreatedOrder);

        return zCreatedOrder;
    }

    /**
     * Cancel an active order
     *
     * @param {Order} zOrder Active Okx order to cancel
     */
    async cancelOrder(zOrder) {
        const response = await this.privateFetch('api/v5/trade/cancel-order', {
            method: 'POST',
            json: {
                instId: zOrder.symbol.replace('/', '-'),
                ordId: zOrder.id,
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
     * @param {string} orderId Okx order id
     */
    async cancelOrderById(orderId) {
        let orderToDelete = this.cache.getCachedOrderById(orderId);

        if (!orderToDelete) {
            const pendingOrders = await this.privateFetch(
                'api/v5/trade/orders-pending',
                {
                    searchParams: {
                        instType: 'SPOT',
                    },
                },
            );

            orderToDelete = pendingOrders.data.find(
                (order) => order.ordId === orderId,
            );

            if (!orderToDelete) {
                throw new ZenfuseRuntimeError(
                    `Order with ${orderId} id does not exists`,
                    'ZEFU_ORDER_NOT_FOUND',
                );
            }

            orderToDelete = this.transformOkxOrder(orderToDelete);
        }

        const response = await this.privateFetch('api/v5/trade/cancel-order', {
            method: 'POST',
            json: {
                instId: orderToDelete.symbol.replace('/', '-'),
                ordId: orderId,
            },
        });

        this.cache.deleteCachedOrderById(orderId);

        utils.linkOriginalPayload(orderToDelete, response);

        return orderToDelete;
    }

    async fetchBalances() {
        const response = await this.privateFetch('api/v5/account/balance', {
            method: 'GET',
        });

        const balances = response.data[0].details
            .filter((b) => b.cashBal > 0)
            .map((b) => {
                return {
                    ticker: b.ccy,
                    free: parseFloat(b.cashBal),
                    used: parseFloat(b.frozenBal),
                };
            });

        utils.linkOriginalPayload(balances, response);

        return balances;
    }

    /**
     *
     * @param {string} orderId
     */
    async fetchOrderById(orderId) {
        let orderToFetch = this.cache.getCachedOrderById(orderId);

        if (!orderToFetch) {
            const pendingOrders = await this.privateFetch(
                'api/v5/trade/orders-pending',
                {
                    searchParams: {
                        instType: 'SPOT',
                    },
                },
            );

            orderToFetch = pendingOrders.data.find(
                (order) => order.ordId === orderId,
            );

            if (!orderToFetch) {
                throw new ZenfuseRuntimeError(
                    `Order with ${orderId} id does not exists`,
                    'ZEFU_ORDER_NOT_FOUND',
                );
            }

            const zOrder = this.transformOkxOrder(orderToFetch);

            this.cache.cacheOrder(zOrder);

            utils.linkOriginalPayload(zOrder, orderToFetch);

            return zOrder;
        }

        const fetchedOrder = await this.privateFetch('api/v5/trade/order', {
            searchParams: {
                ordId: orderId,
                instId: orderToFetch.symbol.replace('/', '-'),
            },
        });

        const zOrder = this.transformOkxOrder(fetchedOrder.data[0]);

        utils.linkOriginalPayload(zOrder, fetchedOrder);

        this.cache.cacheOrder(zOrder);

        return zOrder;
    }

    getAccountDataStream() {
        return new AccountDataStream(this);
    }

    getMarketDataStream() {
        return new MarketDataStream(this);
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
    };

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
    };
}

module.exports = OkxSpot;
