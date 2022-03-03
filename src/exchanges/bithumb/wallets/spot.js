const BithumbBase = require('../base');
const mergeObjects = require('deepmerge');

const utils = require('../utils');

const AccountDataStream = require('../streams/accountDataStream');
const MarketDataStream = require('../streams/marketDataStream');
const { transformZenfuseOrder } = require('../utils');
const NotAuthenticatedError = require('../../../base/errors/notAuthenticated.error');

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
        const markets = await this.publicFetch(
            'spot/ticker',
            {
                searchParams: {
                    symbol: 'ALL',
                },
            }
        );
        // TODO: Cache update here

        const tickers = utils.extractSpotTickers(markets.data);

        utils.linkOriginalPayload(tickers, markets);

        return tickers;
    }

    /**
     * @returns {string[]} Array of ticker pairs on FTX
     */
    async fetchMarkets() {
        const response = await this.publicFetch(
            'spot/ticker',
            {
                searchParams: {
                    symbol: 'ALL',
                },
            }
        );

        // TODO: Cache update here

        const markets = response.data.map((m) => {
            let ticker = m.s.split('-');
            return {
                symbol: m.s,
                baseTicker: ticker[0],
                quoteTicker: ticker[1],
            };
        });

        console.log(markets);

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
        const requestPath = 'spot/ticker';

        const requestOptions = market 
            ? { 
                searchParams: {
                    symbol: market.replace('/', '-')
            } 
        }
            : { 
                searchParams: {
                    symbol: 'ALL' 
            }
        };

        const response = await this.publicFetch(requestPath, requestOptions);

        if (market) {
            const price = {
                symbol: market,
                price: parseFloat(response.data.c),
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
     */
    async createOrder(zOrder) {
        this.validateOrderParams(zOrder);

        const bOrder = transformZenfuseOrder(zOrder);

        console.log(bOrder);

        const bCreatedOrder = await this.privateFetch('spot/placeOrder', {
            method: 'POST',
            json: bOrder,
        });

        console.log(bCreatedOrder);

        const zCreatedOrder = utils.transformBithumbOrder(bCreatedOrder, zOrder);

        this.cache.cacheOrder(zCreatedOrder);

        utils.linkOriginalPayload(zCreatedOrder, bCreatedOrder);

        return zCreatedOrder;
    }

    /**
     * Cancel an active order
     *
     * @param {string} orderId Bithumb order id
     * 
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

        // console.log(response);

        const balances = response.data
            .filter((b) => parseFloat(b.count) > 0)
            .map((b) => {
                return {
                    ticker: b.coinType,
                    free: parseFloat(b.count),
                    used: parseFloat(b.frozen),
                };
            });

        console.log(balances);

        utils.linkOriginalPayload(balances, response);

        return balances;
    }

    /**
     *
     * @param {string} orderId
     * 
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

        console.log(responce);

        const zOrder = utils.transformBithumbOrder(responce, orderToFetch);

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
