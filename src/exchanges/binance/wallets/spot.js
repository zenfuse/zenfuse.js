const mergeObjects = require('deepmerge');

const utils = require('../utils');
const BinanceBase = require('../base');
const AccountDataStream = require('../streams/accountDataStream');
const MarketDataStream = require('../streams/marketDataStream');
const RuntimeError = require('../../../base/errors/runtime.error');

const { timeIntervals } = require('../metadata');
const BaseError = require('../../../base/errors/base.error');

/**
 * @typedef {import('../../../base/exchange').BaseOptions} BaseOptions
 */

/**
 * Binance class for spot wallet API
 */
class BinanceSpot extends BinanceBase {
    static DEFAULT_OPTIONS = {
        defaults: {
            limit: {
                timeInForce: 'GTC',
            },
            market: {},
        },
    };

    /**
     * @param {BaseOptions} options
     */
    constructor(options = {}) {
        const fullOptions = mergeObjects(BinanceSpot.DEFAULT_OPTIONS, options);
        super(fullOptions);
    }

    /**
     * @returns {string[]} Array of tickers on this exchange
     */
    async fetchTickers() {
        const exchangeInfo = await this.publicFetch('api/v3/exchangeInfo');

        this.cache.updateCache(exchangeInfo);

        const spotMarkets = utils.extractSpotMarkets(exchangeInfo.symbols);

        const tickers = utils.extractTickersFromSymbols(spotMarkets);

        utils.linkOriginalPayload(tickers, exchangeInfo);

        return tickers;
    }

    /**
     * @typedef {import('../utils/functions/agregation').structualizedMarket} structualizedMarket
     */

    /**
     * @returns {structualizedMarket} Array of ticker pairs on this exchange
     */
    async fetchMarkets() {
        const exchangeInfo = await this.publicFetch('api/v3/exchangeInfo');

        this.cache.updateCache(exchangeInfo);

        const spotMarkets = utils.extractSpotMarkets(exchangeInfo.symbols);

        const markets = utils.structualizeMarkets(spotMarkets);

        utils.linkOriginalPayload(markets, exchangeInfo);

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

        // NOTE: Binance can return only 1000 candels once. If user interval is to big, it will be unfilled
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
            params.symbol = utils.transformMarketString(market);
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
                throw new RuntimeError(
                    `Cannot find ${symbol} in binance cache`,
                    'ZEFU_CACHE_UNSYNC',
                );
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
            .filter(Boolean);

        utils.linkOriginalPayload(prices, response);

        return prices;
    }

    /**
     * @typedef {import('../utils/functions/transformation').Order} Order
     */

    /**
     * Create new spot order on Binance
     *
     * @param {Order} zOrder Order to create
     */
    async createOrder(zOrder) {
        this.validateOrderParams(zOrder);

        const assignedOrder = utils.assignDefaultsInOrder(
            zOrder,
            this.options.defaults,
        );

        // TODO: Assign defaults in transformation
        const bOrder = utils.transfromZenfuseOrder(assignedOrder);

        const bCreatedOrder = await this.privateFetch('api/v3/order', {
            method: 'POST',
            searchParams: bOrder,
        });

        const zCreadedOrder = utils.transfromBinanceOrder(bCreatedOrder);

        zCreadedOrder.symbol = this.parseBinanceSymbol(bCreatedOrder.symbol);

        this.cache.cacheOrder(zCreadedOrder);

        utils.linkOriginalPayload(zCreadedOrder, bCreatedOrder);

        return zCreadedOrder;
    }

    /**
     * Cancel an active order
     *
     * @param {Order} zOrder Order to cancel
     */
    async cancelOrder(zOrder) {
        this.validateOrderParams(zOrder);

        this.cache.deleteCachedOrderById(zOrder.id);

        const response = await this.privateFetch('api/v3/order', {
            method: 'DELETE',
            searchParams: {
                symbol: zOrder.symbol.replace('/', ''),
                orderId: zOrder.id.toString(),
            },
        });

        const deletedOrder = utils.transfromBinanceOrder(response);

        utils.linkOriginalPayload(deletedOrder, response);

        return deletedOrder;
    }

    /**
     * Cancel an active order
     *
     * **NOTE:** Binance required order symbol for canceling.
     *      If the symbol did not pass, zenfuse.js makes an additional request 'fetchOpenOrders' to find the required symbol.
     *      TODO: Make possible to pass symbol from user
     *
     * @param {string} orderId Binance order id
     */
    async cancelOrderById(orderId) {
        let openOrder = this.cache.getCachedOrderById(orderId);

        if (openOrder) {
            this.cache.deleteCachedOrderById(orderId);
        }

        if (!openOrder) {
            // TODO: Global user orders cache support
            // 	┬──┬ ノ(ò_óノ) Binance api kills nerve cells
            const openOrders = await this.fetchOpenOrders();

            const response = openOrders[Symbol.for('zenfuse.originalPayload')];

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

        const deletedOrder = utils.transfromBinanceOrder(response);

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
     * **NOTE:** Binance requires symbol for fetching order.
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
                // TODO: Make base error better
                throw new BaseError(`Order with ${orderId} id does not exists`);
            }

            // throw 'TODO: Fix cache'; // TODO:!!!
        }

        const response = await this.privateFetch('api/v3/order', {
            searchParams: {
                symbol: cachedOrder.symbol.replace('/', ''),
                orderId: cachedOrder.id.toString(),
            },
        });

        const zOrder = utils.transfromBinanceOrder(response);

        zOrder.symbol = this.parseBinanceSymbol(response.symbol);

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
}

module.exports = BinanceSpot;
