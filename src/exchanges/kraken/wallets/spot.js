const KrakenBase = require('../base');
const mergeObjects = require('deepmerge');

const utils = require('../../../base/utils/utils');

const AccountDataStream = require('../streams/accountDataStream');
const MarketDataStream = require('../streams/marketDataStream');
const ZenfuseRuntimeError = require('../../../base/errors/runtime.error');
const { timeIntervals } = require('../metadata');

/**
 * @typedef {import('../../../base/exchange').BaseOptions} BaseOptions
 */

/**
 * Kraken class for spot wallet API
 */
class KrakenSpot extends KrakenBase {
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
        const fullOptions = mergeObjects(KrakenSpot.DEFAULT_OPTIONS, options);
        super(fullOptions);
    }

    /**
     * @returns {string[]} Array of tickers on this exchange
     */
    async fetchTickers() {
        const markets = await this.publicFetch('0/public/AssetPairs');

        const tickers = Object.entries(markets.result).map(([, ticker]) => ticker.wsname);

        utils.linkOriginalPayload(tickers, markets);

        return tickers;
    }

    /**
     * @returns {string[]} Array of ticker pairs on Kraken
     */
    async fetchMarkets() {
        const response = await this.publicFetch('0/public/AssetPairs');

        const markets = Object.entries(response.result).map(([, m]) => {
            const baseTicker = m.base;
            const quoteTicker = m.quote;
            return {
                symbol: m.wsname,
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
            const symbol = market.replace('/', '');

            const response = await this.publicFetch('0/public/Ticker', {
                searchParams: {
                    pair: symbol,
                },
            });

            const krakenSymbol = Object.entries(response.result)[0];

            const price = {
                symbol: market,
                price: parseFloat(response.result[krakenSymbol].c[0]),
            };

            utils.linkOriginalPayload(price, response);

            return price;
        }

        const prices = this.cache.tickers.map((ticker) => {
            const response = await this.publicFetch('0/public/Ticker', {
                searchParams: {
                    pair: ticker,
                },
            });

            const krakenSymbol = Object.entries(response.result)[0];
    
            return {
                symbol: ticker,
                price: parseFloat(response.result[krakenSymbol].c[0]),
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
     * @returns {Promise<Kline[]>}
     */
    async fetchCandleHistory(params) {
        this.validateCandleHistoryParams(params);

        const response = await this.publicFetch(
            '0/public/OHLC',
            {
                searchParams: {
                    pair: params.symbol.replace('/', ''),
                    interval: timeIntervals[params.interval],
                    since: params.startTime,
                },
            },
        );

        const result = Object.entries(response.result).map(([, candles]) => {
            return candles.map((kCandle) => {
                kCandle = kCandle.map(Number);

                const zCandle = {
                    timestamp: kCandle[0],
                    open: kCandle[1],
                    high: kCandle[2],
                    low: kCandle[3],
                    close: kCandle[4],
                    volume: kCandle[6],
                    interval: params.interval,
                    symbol: params.symbol,
                };

                utils.linkOriginalPayload(zCandle, kCandle);

                return zCandle;
            });
        });

        utils.linkOriginalPayload(result, response);

        return result;
    }

    /**
     * @typedef {import('../utils/functions/transformation').Order} Order
     */

    /**
     * Create new spot order on Kraken
     *
     * @param {Order} zOrder Order to create
     */
    async postOrder(zOrder) {
        this.validateOrderParams(zOrder);

        const xOrder = this.transformZenfuseOrder(zOrder);

        // if (zOrder.type === 'market' && zOrder.side === 'buy') {
        //     let orderTotal = null;

        //     const { price } = await this.fetchPrice(zOrder.symbol);

        //     orderTotal = price * zOrder.quantity;

        //     xOrder.price = orderTotal.toString();
        // }

        const response = await this.privateFetch('0/private/AddOrder', {
            method: 'POST',
            json: xOrder,
        });

        const orderString = response.result.split(' ');
        const xCreatedOrder = {
            side: orderString[0],
            volume: orderString[1],
            pair: orderString[2],
            ordertype: orderString[4],
            price: orderString[5],
            txid: response.result.txid,
        };

        const zCreatedOrder = Object.assign({}, zOrder);

        zCreatedOrder.id = xCreatedOrder.txid;
        zCreatedOrder.status = 'open';
        zCreatedOrder.timestamp = Date.now();

        this.cache.cacheOrder(zCreatedOrder);

        utils.linkOriginalPayload(zCreatedOrder, xCreatedOrder);

        return zCreatedOrder;
    }

    /**
     * Cancel an active order
     *
     * @param {Order} zOrder Active Kraken order to cancel
     */
    async cancelOrder(zOrder) {
        const response = await this.privateFetch('0/private/CancelOrder', {
            method: 'POST',
            json: {
                txid: zOrder.id,
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
     * @param {string} orderId Kraken order id
     */
    async cancelOrderById(orderId) {
        const response = await this.privateFetch('0/private/CancelOrder', {
            method: 'POST',
            json: {
                txid: orderId,
            },
        });

        const orderToDelete = this.cache.getCachedOrderById(orderId);

        this.cache.deleteCachedOrderById(orderId);

        utils.linkOriginalPayload(orderToDelete, response);

        return orderToDelete;
    }

    async fetchBalances() {
        const response = await this.privateFetch('0/private/Balance', {
            method: 'POST',
        });

        const balances = Object.entries(response.result)
            .filter(([, b]) => parseFloat(b) > 0)
            .map(([ticker, b]) => {
                return {
                    ticker: ticker,
                    free: parseFloat(b),
                    used: undefined,
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
        const fetchedOrder = await this.privateFetch('0/private/QueryOrders', {
            method: 'POST',
            json: {
                txid: orderId,
            },
        });

        const zOrder = this.transformKrakenOrder(fetchedOrder.result[orderId]);

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
}

module.exports = KrakenSpot;
