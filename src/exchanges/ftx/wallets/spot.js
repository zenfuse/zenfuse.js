const FtxBase = require('../base');
const mergeObjects = require('deepmerge');

const utils = require('../utils');

const AccountDataStream = require('../streams/accountDataStream');
const MarketDataStream = require('../streams/marketDataStream');

/**
 * @typedef {import('../../../base/exchange').BaseOptions} BaseOptions
 */

/**
 * FTX class for spot wallet API
 * @important should have same
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

        const spotMarkets = utils.extractSpotMarkets(markets.result);

        const tickers = utils.extractTickersFromMarkets(spotMarkets);

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
     *
     * @param {string} market Ticker pair aka symbol
     * @return Last price
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

        const prices = response.result.map((market) => {
            return {
                symbol: market.name,
                price: market.price,
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

        const zCreadedOrder = utils.transfromFtxOrder(bCreatedOrder);

        zCreadedOrder.symbol =
            this.cache.parsedSymbols[bCreatedOrder.symbol].join('/');

        utils.linkOriginalPayload(zCreadedOrder, bCreatedOrder);

        return zCreadedOrder;
    }

    /**
     * Cancel an active order
     *
     * @param {object} order Order object to delete
     * @param {string} order.symbol Order ticker pair, for example `BTC/USDT`
     * @param {string} order.id Ftx order id
     */
    async cancelOrder(order) {
        const response = await this.privateFetch('api/v3/order', {
            method: 'DELETE',
            searchParams: {
                symbol: order.symbol,
                orderId: order.id.toString(),
            },
        });

        utils.linkOriginalPayload(response, response);

        return response;
    }

    async fetchOpenOrders() {
        const response = await this.privateFetch('api/v3/openOrders');

        // TODO: order status object

        utils.linkOriginalPayload(response, response);

        return response;
    }

    async fetchBalances() {
        const response = await this.privateFetch('api/wallet/balances');

        const balances = response.result.map((b) => {
            return {
                ticker: b.coin,
                free: b.free,
                used: b.total - b.free,
            };
        });

        utils.linkOriginalPayload(balances, response);

        return balances;
    }

    getAccountDataStream() {
        return new AccountDataStream(this);
    }

    getMarketDataStream() {
        return new MarketDataStream(this);
    }
}

module.exports = FtxSpot;
