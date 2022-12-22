const mergeObjects = require('deepmerge');

const utils = require('../../../base/utils/utils');
const HuobiBase = require('../base');
const AccountDataStream = require('../streams/accountDataStream');
const MarketDataStream = require('../streams/marketDataStream');

const { timeIntervals } = require('../metadata');
const ZenfuseUserError = require('../../../base/errors/user.error');
const ZenfuseBaseError = require('../../../base/errors/base.error');

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
     * Huobi has unique id for spot account. Which required for some requests
     */
    accountId;

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
                const isPossibleToCut =
                    result[0].timestamp < params.endTime &&
                    result[result.length - 1].timestamp > params.startTime;

                if (isPossibleToCut) {
                    return result.filter(({ timestamp }) => {
                        return (
                            timestamp < params.endTime &&
                            timestamp > params.startTime
                        );
                    });
                }
            }

            if (params.startTime && !params.endTime) {
                const isPossibleToCut =
                    result[result.length - 1].timestamp > params.startTime;

                if (isPossibleToCut) {
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
     * @param {Order} params Order to create
     */
    async postOrder(params) {
        this.validateOrderParams(params);

        const hOrder = utils.pipe(
            this.preciseOrderValues.bind(this),
            this.transformZenfuseOrder.bind(this),
        )(params);

        hOrder['account-id'] = await this.getAccountId();

        // NOTE: For buy market order 'amount' is quantity of quote ticker in order ಠ_ಠ
        // https://huobiapi.github.io/docs/spot/v1/en/#place-a-new-order:~:text=order%20size-,(for%20buy%20market%20order%2C%20it%27s%20order%20value),-NA
        const isConvertRequired =
            params.type === 'market' && params.side === 'buy';

        if (isConvertRequired) {
            const { price } = await this.fetchPrice(params.symbol);

            hOrder.amount = price * params.quantity;

            /**
             * @see http://www.jacklmoore.com/notes/rounding-in-javascript/
             * @param {number} value
             * @param {number} limit
             * @returns {number} Precised number
             */
            const precise = (value, limit) => {
                return Number(Math.floor(value + 'e' + limit) + 'e-' + limit);
            };

            const { totalPrecision } = this.cache.globalCache
                .get('marketsPrecisionInfo')
                .get(params.symbol);

            hOrder.total = precise(hOrder.total, totalPrecision);
        }

        const response = await this.privateFetch('v1/order/orders/place', {
            method: 'POST',
            json: hOrder,
        });

        const zOrder = {
            id: response.data,
            timestamp: Date.now(),
            status: 'open',
            ...params,
        };

        utils.linkOriginalPayload(zOrder, response);

        return zOrder;
    }

    /**
     * Cancel an active order
     *
     * @param {Order} zOrder Huobi active order to cancel
     */
    async cancelOrder({ id, symbol }) {
        const response = await this.privateFetch(
            `v1/order/orders/${id}/submitcancel`,
            {
                method: 'POST',
                json: {
                    'order-id': id,
                    symbol,
                },
            },
        );

        const cachedOrder = this.cache.getCachedOrderById(id);

        if (!cachedOrder) {
            const order = { id, symbol };
            utils.linkOriginalPayload(order, response);
            return order;
        }

        this.cache.deleteCachedOrderById(id);

        cachedOrder.status = 'canceled';

        utils.linkOriginalPayload(cachedOrder, response);

        return cachedOrder;
    }

    /**
     * Cancel an active order
     *
     * @param {string} orderId Huobi order id
     */
    async cancelOrderById(orderId) {
        return this.cancelOrder({ id: orderId });
    }

    async fetchOpenOrders() {
        const response = await this.privateFetch('v1/order/openOrders', {
            searchParams: {
                'account-id': await this.getAccountId(),
            },
        });

        const openOrders = response.data.map((order) => {
            const zOrder = this.transformHuobiOrder(order);
            zOrder.symbol = this.parseHuobiSymbol(order.symbol);
            return zOrder;
        });

        utils.linkOriginalPayload(openOrders, response);

        return openOrders;
    }

    async fetchBalances() {
        const accountId = await this.getAccountId();

        const response = await this.privateFetch(
            `v1/account/accounts/${accountId}/balance`,
        );

        const mapedBalances = response.data.list.reduce(
            (map, { currency, type, balance }) => {
                if (type === 'trade') {
                    map.set(currency, {
                        ticker: currency,
                        free: parseFloat(balance),
                        used: map.has(currency) ? map.get(currency).used : 0,
                    });
                }
                if (type === 'frozen') {
                    map.set(currency, {
                        ticker: currency,
                        free: map.has(currency) ? map.get(currency).free : 0,
                        used: parseFloat(balance),
                    });
                }
                return map;
            },
            new Map(),
        );

        const balances = Array.from(mapedBalances.values()).filter(
            (b) => b.free > 0 || b.used > 0,
        );

        utils.linkOriginalPayload(balances, response);

        return balances;
    }

    /**
     *
     * @param {string} orderId
     */
    async fetchOrderById(orderId) {
        const response = await this.privateFetch(`v1/order/orders/${orderId}`);

        const zOrder = this.transformHuobiOrder(response.data);

        zOrder.symbol = this.parseHuobiSymbol(response.data.symbol);

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
     * @private
     */
    async getAccountId() {
        if (!this.accountId) {
            const response = await this.privateFetch('v1/account/accounts');

            this.accountId = response.data.find((a) => a.type === 'spot').id;
        }

        return this.accountId;
    }
}

module.exports = HuobiSpot;
