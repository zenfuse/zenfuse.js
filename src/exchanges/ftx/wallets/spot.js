const FtxBase = require('../base');
const mergeObjects = require('deepmerge');

const utils = require('../../../base/utils/utils');

const AccountDataStream = require('../streams/accountDataStream');
const MarketDataStream = require('../streams/marketDataStream');

/**
 * @typedef {import('../../../base/exchange').BaseOptions} BaseOptions
 */

/**
 * FTX class for spot wallet API
 */
class FtxSpot extends FtxBase {
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
        const fullOptions = mergeObjects(FtxSpot.DEFAULT_OPTIONS, options);
        super(fullOptions);
    }

    /**
     * @returns {string[]} Array of tickers on this exchange
     */
    async fetchTickers() {
        const markets = await this.publicFetch('api/markets');

        // TODO: Cache update here

        const spotMarkets = markets.result.filter(
            (market) => market.type === 'spot',
        );

        const tickers = spotMarkets
            .map((market) => {
                return [market.baseCurrency, market.quoteCurrency];
            })
            .flat()
            .filter(Boolean);

        utils.linkOriginalPayload(tickers, markets);

        return tickers;
    }

    /**
     * @returns {string[]} Array of ticker pairs on FTX
     */
    async fetchMarkets() {
        const response = await this.publicFetch('api/markets');

        // TODO: Cache update here

        const spotMarkets = response.result.filter(
            (market) => market.type === 'spot',
        );

        const markets = spotMarkets.map((m) => {
            return {
                symbol: m.name,
                baseTicker: m.baseCurrency,
                quoteTicker: m.quoteCurrency,
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
        const requestPath = market ? `api/markets/${market}` : 'api/markets';

        const response = await this.publicFetch(requestPath);

        if (market) {
            const price = {
                symbol: market,
                price: response.result.price,
            };

            utils.linkOriginalPayload(price, response);

            return price;
        }

        const prices = response.result
            .filter((market) => market.type === 'spot')
            .map((market) => {
                // NOTE: FTX Return dead tokens with null price
                return {
                    symbol: market.name,
                    price: market.price || 0,
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
            `api/markets/${params.symbol}/candles`,
            {
                searchParams: {
                    resolution: utils.timeIntervalToSeconds(params.interval),
                    start_time: params.startTime,
                    end_time: params.endTime,
                },
            },
        );

        const result = response.result.map((fCandle) => {
            const zCandle = {
                timestamp: new Date(fCandle.startTime).getTime(),
                open: fCandle.open,
                high: fCandle.high,
                low: fCandle.low,
                close: fCandle.close,
                volume: fCandle.volume,
                interval: params.interval,
                symbol: params.symbol,
            };

            utils.linkOriginalPayload(zCandle, fCandle);

            return zCandle;
        });

        utils.linkOriginalPayload(result, response);

        return result;
    }

    /**
     * @typedef {import('../utils/functions/transformation').Order} Order
     */

    /**
     * Create new spot order on FTX
     *
     * @param {Order} zOrder Order to create
     */
    async createOrder(zOrder) {
        this.validateOrderParams(zOrder);

        const fOrder = this.transformZenfuseOrder(zOrder);

        const fCreatedOrder = await this.privateFetch('api/orders', {
            method: 'POST',
            json: fOrder,
        });

        const zCreatedOrder = this.transformFtxOrder(fCreatedOrder.result);

        this.cache.cacheOrder(zCreatedOrder);

        utils.linkOriginalPayload(zCreatedOrder, fCreatedOrder);

        return zCreatedOrder;
    }

    /**
     * Cancel an active order
     *
     * @param {string} zOrder Ftx active order to cancel
     */
    async cancelOrder(zOrder) {
        const response = await this.privateFetch(`api/orders/${zOrder.id}`, {
            method: 'DELETE',
        });

        zOrder.status = 'canceled';

        this.cache.deleteCachedOrderById(zOrder.id);

        utils.linkOriginalPayload(zOrder, response);

        return zOrder;
    }

    /**
     * Cancel an active order
     *
     * @param {string} orderId Ftx order id
     */
    async cancelOrderById(orderId) {
        const response = await this.privateFetch(`api/orders/${orderId}`, {
            method: 'DELETE',
        });

        let deletedOrder = this.cache.getCachedOrderById(orderId);

        if (!deletedOrder) {
            deletedOrder = this.fetchOrderById(orderId);
        }

        this.cache.deleteCachedOrderById(orderId);

        utils.linkOriginalPayload(deletedOrder, response);

        return deletedOrder;
    }

    async fetchOpenOrders() {
        const response = await this.privateFetch('api/orders');

        const openOrders = response.result.map((order) => {
            return this.transformFtxOrder(order);
        });

        utils.linkOriginalPayload(openOrders, response);

        return openOrders;
    }

    async fetchBalances() {
        const response = await this.privateFetch('api/wallet/balances');

        const balances = response.result
            .filter((b) => b.total > 0)
            .map((b) => {
                return {
                    ticker: b.coin,
                    free: parseFloat(b.free),
                    used: parseFloat(b.total) - parseFloat(b.free),
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
        const response = await this.privateFetch(`api/orders/${orderId}`);

        const zOrder = this.transformFtxOrder(response.result);

        return zOrder;
    }

    getAccountDataStream() {
        return new AccountDataStream(this);
    }

    getMarketDataStream() {
        return new MarketDataStream(this);
    }
}

module.exports = FtxSpot;
