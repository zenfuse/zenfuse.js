const BithumbBase = require('../base');
const mergeObjects = require('deepmerge');

const utils = require('../utils');

const AccountDataStream = require('../streams/accountDataStream');
const MarketDataStream = require('../streams/marketDataStream');

/**
 * @typedef {import('../../../base/exchange').BaseOptions} BaseOptions
 */

/**
 * Bithumb class for spot wallet API
 *
 * @important should have same
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
        const markets = await this.publicFetch('/openapi/v1/spot/ticker?symbol=ALL'); //TODO: check options

        // TODO: Cache update here

        const tickers = utils.extractSpotTickers(markets.data);

        utils.linkOriginalPayload(tickers, markets);

        return tickers;
    }

    /**
     * @returns {string[]} Array of ticker pairs on FTX
     */
    async fetchMarkets() {
        const response = await this.publicFetch('api/markets');

        // TODO: Cache update here

        const spotMarkets = utils.extractSpotMarkets(response.result);

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
     *
     * @note If the symbol is not sent, prices for all symbols will be returned in an array.
     * @param {string} market Ticker pair aka symbol
     * @returns Last price
     */
    async fetchPrice(market = '') {
        const requestPath = market ? `/openapi/v1/spot/ticker?symbol=${market}` : '/openapi/v1/spot/ticker?symbol=ALL';

        const response = await this.publicFetch(requestPath);

        if (market) {
            const price = {
                symbol: market,
                price: response.data.c,
            };

            utils.linkOriginalPayload(price, response);

            return price;
        }

        const prices = response.data
            .map((market) => {
                return {
                    symbol: market.s,
                    price: market.c || 0,
                };
            });

        utils.linkOriginalPayload(prices, response);

        return prices;
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

        const fOrder = utils.transformZenfuseOrder(zOrder);

        const fCreatedOrder = await this.privateFetch('api/orders', {
            method: 'POST',
            json: fOrder,
        });

        const zCreatedOrder = utils.transfromBithumbOrder(fCreatedOrder.result);

        this.cache.cacheOrder(zCreatedOrder);

        utils.linkOriginalPayload(zCreatedOrder, fCreatedOrder);

        return zCreatedOrder;
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

    // TODO: Test for this
    async fetchOpenOrders() {
        throw 'Not implemented';
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
        const responce = await this.privateFetch(`api/orders/${orderId}`);

        const zOrder = utils.transformBithumbOrder(responce.result);

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
