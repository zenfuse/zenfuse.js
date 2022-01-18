const BinanceBase = require('../base');
const mergeObjects = require('deepmerge');

const utils = require('../utils');

const AccountDataStream = require('../streams/accountDataStream');
const MarketDataStream = require('../streams/marketDataStream');
const ZenfuseError = require('../../../base/errors/base.error');

/**
 * @typedef {import('../../../base/exchange').BaseOptions} BaseOptions
 */

/**
 * Binance class for spot wallet API
 * @important should have same
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
     * @returns Array of ticker pairs on this exchange
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
     *
     * @note If the symbol is not sent, prices for all symbols will be returned in an array.
     *
     * @param {string} market Ticker pair aka symbol
     * @return Last price
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
                throw new ZenfuseError(
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
     * @important Binance required order symbol for canceling.
     *      If the symbol did not pass, zenfuse.js makes an additional request 'fetchOpenOrders' to find the required symbol.
     *      So if you know order symbol, better pass it to didn't make unnecessary HTTP requests.
     *
     * @param {string} orderId Binance order id
     */
    async cancelOrderById(orderId) {
        let openOrder = this.cache.getCachedOrderById(orderId);

        if (openOrder) {
            this.cache.deleteCachedOrderById(orderId);
        }

        if (!openOrder) {
            process.emitWarning(
                `Cannot find ${orderId} binance order in local cache`,
                {
                    code: 'ZEFU_CACHE_UNSYNC',
                    detail: 'This is a warning because zenfuse smart enough to handle unsynced cache. But this should be reported',
                },
            );

            // 	┬──┬ ノ(ò_óノ) Binance api kills nerve cells
            const openOrders = await this.fetchOpenOrders();

            const response = openOrders[Symbol.for('zenfuse.originalPayload')];

            const orderToDelete = response.find((o) => {
                return o.orderId === order.id;
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

        const balances = response.balances.map((b) => {
            return {
                ticker: b.asset,
                free: b.free,
                used: b.locked,
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
        let orderToDelete = this.cache.getCachedOrderById(orderId);

        if (!orderToDelete) {
            throw 'Not in cache'; // TODO: Do something
        }

        const response = await this.privateFetch('api/v3/order', {
            searchParams: {
                symbol: orderToDelete.symbol.replace('/', ''),
                orderId: orderToDelete.id.toString(),
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
