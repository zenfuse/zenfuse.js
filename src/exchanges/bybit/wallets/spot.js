const { deprecate } = require('util');
const mergeObjects = require('deepmerge');

const utils = require('../../../base/utils/utils');
const BybitBase = require('../base');
const AccountDataStream = require('../streams/accountDataStream');
const MarketDataStream = require('../streams/marketDataStream');
const RuntimeError = require('../../../base/errors/runtime.error');

const { timeIntervals } = require('../metadata');

/**
 * @typedef {import('../../../base/exchange').BaseOptions} BaseOptions
 * @typedef {import('../../../base/schemas/orderParams').ZenfuseOrderParams} OrderParams
 * @typedef {import('../../../base/schemas/openOrder').PlacedOrder} PostedOrder
 */

/**
 * Bybit class for spot wallet API
 */
class BybitSpot extends BybitBase {
    /**
     * List of default options
     */
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
        const fullOptions = mergeObjects(BybitSpot.DEFAULT_OPTIONS, options);
        super(fullOptions);

        // TODO: Remove after v1
        this.createOrder = deprecate(
            this.postOrder.bind(this),
            'createOrder() is deprecated. Use postOrder() instead.',
            'ZENFUSE_DEP001',
        );
    }

    /**
     * @returns {string[]} Array of tickers on this exchange
     */
    async fetchTickers() {
        const response = await this.publicFetch('/v5/market/instruments-info', {
            searchParams: {
                category: 'spot',
            },
        });

        this.cache.updateCache(response);

        const spotMarkets = response.result.list.filter((market) =>
            market.permissions.includes('SPOT'),
        );

        const stringSet = new Set();

        spotMarkets.forEach((market) => {
            stringSet.add(market.baseAsset);
            stringSet.add(market.quoteAsset);
        });

        const tickers = [...stringSet];

        utils.linkOriginalPayload(tickers, response);

        return tickers;
    }

    /**
     * @returns {string[]} Array of ticker pairs on this exchange
     */
    async fetchMarkets() {
        const response = await this.publicFetch('v5/market/tickers');

        this.cache.updateCache(response);

        const spotMarkets = response.symbols.filter((market) =>
            market.permissions.includes('SPOT'),
        );

        const markets = spotMarkets.map((market) => {
            return {
                symbol: `${market.baseAsset}/${market.quoteAsset}`,
                baseTicker: market.baseAsset,
                quoteTicker: market.quoteAsset,
            };
        });

        utils.linkOriginalPayload(markets, response);

        return markets;
    }

    /**
     * @typedef {import('../../../base/schemas/kline.js').ZenfuseKline} Kline
     * @param {object} params
     * @param {string} params.symbol
     * @param {timeIntervals} params.interval
     * @param {number} [params.startTime]
     * @param {number} [params.endTime]
     * @returns {Kline[]}
     */
    async fetchCandleHistory(params) {
        this.validateCandleHistoryParams(params);

        // NOTE: Bybit can return only 1000 candles once. If user interval is to big, it will be unfilled
        // TODO: Additional responses to fill required interval
        const response = await this.publicFetch('api/v3/klines', {
            searchParams: {
                symbol: params.symbol.replace('/', ''),
                interval: params.interval,
                startTime: params.startTime,
                endTime: params.endTime,
                limit: 1000, // Overwrite default 500 limit
            },
        });

        const result = response.map((bCandle) => {
            const zCandle = {
                timestamp: bCandle[0],
                open: parseFloat(bCandle[1]),
                high: parseFloat(bCandle[2]),
                low: parseFloat(bCandle[3]),
                close: parseFloat(bCandle[4]),
                volume: parseFloat(bCandle[5]),
                interval: params.interval,
                symbol: params.symbol,
            };

            utils.linkOriginalPayload(zCandle, bCandle);

            return zCandle;
        });

        utils.linkOriginalPayload(result, response);

        return result;
    }

    /**
     * @typedef {object} PriceObject
     * @property {string} symbol
     * @property {number} price
     */

    /**
     * **DEV:** If the symbol is not sent, prices for all symbols will be returned in an array.
     *
     * @param {string} market Ticker pair aka symbol
     * @returns {PriceObject} Price object
     */
    async fetchPrice(market) {
        const params = {};

        if (market) {
            params.symbol = market.replace('/', '').toUpperCase();
        }

        const response = await this.publicFetch('api/v3/ticker/price', {
            searchParams: params,
        });

        if (market) {
            const price = {
                symbol: market,
                price: parseInt(response.price),
            };

            utils.linkOriginalPayload(price, response);

            return price;
        }

        const createSymbol = (symbol) => {
            if (!this.cache.parsedSymbols.has(symbol)) {
                // Bybit can return price for unlisted markets
                // Skip symbol for now.
                // TODO: Do something with that
                return undefined;
            }
            return this.cache.parsedSymbols.get(symbol).join('/');
        };

        const prices = response
            .map((bPrice) => {
                let symbol;

                symbol = createSymbol(bPrice.symbol);

                return {
                    symbol,
                    price: parseInt(bPrice.price),
                };
            })
            .filter((p) => !!p && !!p.symbol);

        utils.linkOriginalPayload(prices, response);

        return prices;
    }

    /**
     * Post new spot order on Bybit
     *
     * @param {OrderParams} zOrder Order parameters
     * @returns {Promise<PostedOrder>}
     */
    async postOrder(zOrder) {
        this.validateOrderParams(zOrder);

        await this.cache.globalCache.updatingPromise;

        const bOrder = utils.pipe(
            this.preciseOrderValues.bind(this),
            this.transformZenfuseOrder,
            this.assignDefaultsInOrder,
        )(zOrder);

        const bPostedOrder = await this.privateFetch('api/v3/order', {
            method: 'POST',
            searchParams: bOrder,
        });

        const zCreatedOrder = this.transformBybitOrder(bPostedOrder);

        zCreatedOrder.symbol = await this.parseBybitSymbol(bPostedOrder.symbol);

        this.cache.cacheOrder(zCreatedOrder);

        utils.linkOriginalPayload(zCreatedOrder, bPostedOrder);

        return zCreatedOrder;
    }

    /**
     * Cancel an active order
     *
     * @param {OrderParams} zOrder Order to cancel
     */
    async cancelOrder(zOrder) {
        this.cache.deleteCachedOrderById(zOrder.id);

        const response = await this.privateFetch('api/v3/order', {
            method: 'DELETE',
            searchParams: {
                symbol: zOrder.symbol.replace('/', ''),
                orderId: zOrder.id.toString(),
            },
        });

        const deletedOrder = this.transformBybitOrder(response);

        deletedOrder.status = 'canceled';

        utils.linkOriginalPayload(deletedOrder, response);

        return deletedOrder;
    }

    /**
     * Cancel an active order
     *
     * **NOTE:** Bybit required order symbol for canceling.
     *      If the symbol did not pass, zenfuse.js makes an additional request 'fetchOpenOrders' to find the required symbol.
     *
     * @param {string} orderId Bybit order id
     */
    async cancelOrderById(orderId) {
        let openOrder = this.cache.getCachedOrderById(orderId);

        if (openOrder) {
            this.cache.deleteCachedOrderById(orderId);
        }

        if (!openOrder) {
            // TODO: Global user orders cache support
            // 	┬──┬ ノ(ò_óノ) Bybit api kills nerve cells
            const openOrders = await this.fetchOpenOrders();

            const response = openOrders.originalPayload;

            const orderToDelete = response.find((o) => {
                return o.orderId === orderId;
            });

            if (!orderToDelete) {
                throw new Error('Order symbol not found'); // TODO: Specific error desc
            }

            openOrder = orderToDelete.symbol;
        }

        const response = await this.privateFetch('api/v3/order', {
            method: 'DELETE',
            searchParams: {
                symbol: openOrder.symbol.replace('/', ''),
                orderId: openOrder.id.toString(),
            },
        });

        const deletedOrder = this.transformBybitOrder(response);

        utils.linkOriginalPayload(deletedOrder, response);

        return deletedOrder;
    }

    async fetchOpenOrders() {
        const response = await this.privateFetch('api/v3/openOrders');

        // TODO: order status object

        utils.linkOriginalPayload(response, response);

        return response;
    }

    async fetchBalances() {
        const response = await this.privateFetch('api/v3/account');

        const balances = response.balances
            .filter((b) => b.free > 0 || b.locked > 0)
            .map((b) => ({
                ticker: b.asset,
                free: parseFloat(b.free),
                used: parseFloat(b.locked),
            }));

        utils.linkOriginalPayload(balances, response);

        return balances;
    }

    // TODO: fetchOrder() method

    /**
     * **NOTE:** Bybit requires symbol for fetching order.
     *
     * @param {string} orderId
     */
    async fetchOrderById(orderId) {
        let cachedOrder = this.cache.getCachedOrderById(orderId);

        if (!cachedOrder) {
            // Should find this order cur binance want symbol for fetching
            const openOrders = await this.privateFetch('api/v3/openOrders');

            cachedOrder = openOrders.find((o) => o.orderId === orderId);

            if (!cachedOrder) {
                throw new RuntimeError(
                    `Order with ${orderId} id does not exists`,
                    'ZEFU_ORDER_NOT_FOUND',
                );
            }

            throw 'TODO: Fix this cache error'; // TODO:!!!
        }

        const response = await this.privateFetch('api/v3/order', {
            searchParams: {
                symbol: cachedOrder.symbol.replace('/', ''),
                orderId: cachedOrder.id.toString(),
            },
        });

        const zOrder = this.transformBybitOrder(response);

        zOrder.symbol = await this.parseBybitSymbol(response.symbol);

        this.cache.cacheOrder(zOrder);

        utils.linkOriginalPayload(zOrder, response);

        return zOrder;
    }

    getAccountDataStream() {
        return new AccountDataStream(this);
    }

    getMarketDataStream() {
        return new MarketDataStream(this);
    }

    /**
     * Insert default values for specific order type
     *
     * **DEV** All values should be for zenfuse interface
     *
     * @private
     * @param {OrderParams} order
     * @returns {OrderParams}
     */
    assignDefaultsInOrder(order) {
        let newOrder;

        if (order.type.toLowerCase() === 'limit') {
            newOrder = mergeObjects(
                BybitSpot.DEFAULT_OPTIONS.defaults.limit,
                order,
            );
        }

        if (order.type.toLowerCase() === 'market') {
            newOrder = mergeObjects(
                BybitSpot.DEFAULT_OPTIONS.defaults.market,
                order,
            );
        }

        return newOrder;
    }
}

module.exports = BybitSpot;
