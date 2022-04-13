const OkxBase = require('../base');
const mergeObjects = require('deepmerge');

const utils = require('../utils');

const AccountDataStream = require('../streams/accountDataStream');
const MarketDataStream = require('../streams/marketDataStream');

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

        // TODO: Cache update here

        const tickers = utils.extractSpotTickers(markets.data);

        // const tickers = utils.extractTickersFromMarkets(spotMarkets);

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

        // TODO: Cache update here

        const markets = response.data.map((m) => {
            let ticker = m.instId.split('-');
            return {
                symbol: m.instId,
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
        if (market) {
            const requestPath = 'api/v5/market/ticker';
            const instId = market.replace('/', '-');
            const response = await this.publicFetch(requestPath, {
                searchParams: {
                    instId: instId,
                },
            });
            const price = {
                symbol: market,
                price: parseFloat(response.data[0].last),
            };

            utils.linkOriginalPayload(price, response);

            return price;
        }

        const requestPath = 'api/v5/market/tickers';
        const instType = 'SPOT';
        const response = await this.publicFetch(requestPath, {
            searchParams: {
                instType: instType,
            },
        });

        const prices = response.data.map((market) => {
            return {
                symbol: market.instId.replace('-', '/'),
                price: parseFloat(market.last) || 0,
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

        const xOrder = utils.transformZenfuseOrder(zOrder);

        if (zOrder.type === 'market' && zOrder.side === 'buy') {
            let orderTotal = null;

            const { price } = await this.fetchPrice(zOrder.symbol);

            orderTotal = price * zOrder.quantity;

            xOrder.sz = orderTotal.toString();
        }

        const xCreatedOrder = await this.privateFetch('api/v5/trade/order', {
            method: 'POST',
            json: xOrder,
        });

        const zCreatedOrder = utils.transformOkxOrder(xCreatedOrder, zOrder);

        this.cache.cacheOrder(zCreatedOrder);

        utils.linkOriginalPayload(zCreatedOrder, xCreatedOrder);

        return zCreatedOrder;
    }

    /**
     * Cancel an active order
     *
     * @param {string} orderId Okx order id
     */
    async cancelOrderById(orderId) {
        let orderToDelete = this.cache.getCachedOrderById(orderId);

        console.log(orderToDelete);

        if (!orderToDelete) {
            orderToDelete = this.fetchOrderById(orderId);
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

    // TODO: Test for this
    async fetchOpenOrders() {
        throw 'Not implemented';
    }

    async fetchBalances() {
        const response = await this.privateFetch('api/v5/account/balance', {
            method: 'GET',
        });

        let data = response.data[0].details;

        const balances = data
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
        const responce = await this.privateFetch('api/v5/trade/order', {
            method: 'GET',
            searchParams: {
                //TODO: ordId or clOrdId
            },
        });

        const zOrder = utils.transformOkxOrder(responce.result);

        return zOrder;
    }

    getAccountDataStream() {
        return new AccountDataStream(this);
    }

    getMarketDataStream() {
        return new MarketDataStream(this);
    }
}

module.exports = OkxSpot;
