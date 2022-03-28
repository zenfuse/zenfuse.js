const mergeObjects = require('deepmerge');

const utils = require('../utils');
const HuobiBase = require('../base');
const AccountDataStream = require('../streams/accountDataStream');
const MarketDataStream = require('../streams/marketDataStream');

const { timeIntervals } = require('../metadata');
const ZenfuseUserError = require('../../../base/errors/user.error');

/**
 * @typedef {import('../../../base/exchange').BaseOptions} BaseOptions
 */

/**
 * Huobi class for spot wallet API
 */
class HuobiSpot extends HuobiBase {
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
        const fullOptions = mergeObjects(HuobiSpot.DEFAULT_OPTIONS, options);
        super(fullOptions);
    }

    /**
     * @returns {string[]} Array of tickers on this exchange
     */
    async fetchTickers() {
        const response = await this.publicFetch(
            'v2/settings/common/currencies',
        );

        const tickers = response.data.map((t) => t.dn);

        utils.linkOriginalPayload(tickers, response);

        return tickers;
    }

    /**
     * @typedef {import('../utils/functions/agregation').structualizedMarket} structualizedMarket
     */

    /**
     * @returns {structualizedMarket} Array of ticker pairs on this exchange
     */
    async fetchMarkets() {
        const response = await this.publicFetch('v2/settings/common/symbols');

        this.cache.updateCache(response);

        const markets = response.data.map((m) => {
            return {
                symbol: m.dn,
                baseTicker: m.bcdn,
                quoteTicker: m.qcdn,
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

        // TODO: Rework intervals
        if (timeIntervals[params.interval] === null) {
            throw new ZenfuseUserError(
                `Interval ${params.interval} doesn't support Huobi. Use any of these 1m, 5m, 15m, 30m, 1h, 4h, 1d, 1w, 1M`,
                'UNSUPPORTED_FEATURE',
            );
        }

        const response = await this.publicFetch('market/history/kline', {
            searchParams: {
                symbol: params.symbol.toLowerCase().replace('/', ''),
                period: timeIntervals[params.interval],
                size: 2000, // Overwrite default 150 limit
            },
        });

        const result = response.data.map((hCandle) => {
            const zCandle = {
                timestamp: hCandle.id * 1000,
                open: hCandle.open,
                high: hCandle.high,
                low: hCandle.low,
                close: hCandle.close,
                volume: hCandle.vol,
                interval: params.interval,
                symbol: params.symbol,
            };

            utils.linkOriginalPayload(zCandle, hCandle);

            return zCandle;
        });

        // NOTE: Huobi API doesn't support custom perioud fetching
        // Trying to cut candles with user parameters
        if (params.startTime || params.endTime) {
            if (params.startTime && params.endTime) {
                const isPossimbleToCut =
                    result[0].timestamp < params.endTime &&
                    result[result.length - 1].timestamp > params.startTime;

                if (isPossimbleToCut) {
                    return result.filter(({ timestamp }) => {
                        return (
                            timestamp < params.endTime &&
                            timestamp > params.startTime
                        );
                    });
                }
            }

            if (params.startTime && !params.endTime) {
                const isPossimbleToCut =
                    result[result.length - 1].timestamp > params.startTime;

                if (isPossimbleToCut) {
                    return result.filter(({ timestamp }) => {
                        return timestamp > params.startTime;
                    });
                }
            }

            throw new ZenfuseUserError(
                "Huobi API doesn't support custom period fetching, you see this error because zenfusejs unable to cut candles with your parameters",
                'UNSUPPORTED_FEATURE',
            );
        }

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
        let response;

        if (market) {
            response = await this.publicFetch('market/detail', {
                searchParams: {
                    symbol: market.toLowerCase().replace('/', ''),
                },
            });

            const price = {
                symbol: market,
                price: response.tick.close,
            };

            utils.linkOriginalPayload(price, response);

            return price;
        }

        response = await this.publicFetch('market/tickers');

        const prices = response.data
            .map((t) => {
                // NOTE: Some markets doesnt includes in list, so symbol unable to parse
                if (!this.cache.parsedSymbols.has(t.symbol)) {
                    return;
                }
                return {
                    symbol: this.parseHuobiSymbol(t.symbol),
                    price: t.close,
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
     * Create new spot order on Huobi
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

        const zCreadedOrder = utils.transfromHuobiOrder(bCreatedOrder);

        zCreadedOrder.symbol = this.parseHuobiSymbol(bCreatedOrder.symbol);

        this.cache.cacheOrder(zCreadedOrder);

        utils.linkOriginalPayload(zCreadedOrder, bCreatedOrder);

        return zCreadedOrder;
    }

    /**
     * Cancel an active order
     *
     * **NOTE:** Huobi required order symbol for canceling.
     *      If the symbol did not pass, zenfuse.js makes an additional request 'fetchOpenOrders' to find the required symbol.
     *      TODO: Make possible to pass symbol from user
     *
     * @param {string} orderId Huobi order id
     */
    async cancelOrderById(orderId) {
        let openOrder = this.cache.getCachedOrderById(orderId);

        if (openOrder) {
            this.cache.deleteCachedOrderById(orderId);
        }

        if (!openOrder) {
            // TODO: Global user orders cache support
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

        const deletedOrder = utils.transfromHuobiOrder(response);

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

    /**
     *
     * @param {string} orderId
     */
    async fetchOrderById(orderId) {
        let orderToDelete = this.cache.getCachedOrderById(orderId);

        if (!orderToDelete) {
            throw 'TODO: Fix cache'; // TODO:!!!
        }

        const response = await this.privateFetch('api/v3/order', {
            searchParams: {
                symbol: orderToDelete.symbol.replace('/', ''),
                orderId: orderToDelete.id.toString(),
            },
        });

        const zOrder = utils.transfromHuobiOrder(response);

        zOrder.symbol = this.parseHuobiSymbol(response.symbol);

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

module.exports = HuobiSpot;
