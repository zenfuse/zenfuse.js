const BinanceBase = require('../base');
const mergeObjects = require('deepmerge');

const utils = require('../utils');

const AccountDataStream = require('../streams/accountDataStream');
const MarketDataStream = require('../streams/marketDataStream');

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

        const binanceCache = {
            tickers: this.cache.tickers,
            parsedSymbols: this.cache.parsedSymbols,
        };

        const createSymbol = (symbol) => {
            return this.cache.parsedSymbols[symbol].join('/');
        };

        const prices = response
            .map((bPrice) => {
                let symbol;
                try {
                    symbol = createSymbol(bPrice.symbol);
                } catch {
                    // TODO: Get symbol for hiden market
                    return;
                }

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

        zCreadedOrder.symbol =
            this.cache.parsedSymbols[bCreatedOrder.symbol].join('/');

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
     * @param {object} order Order object to delete
     * @param {string} order.symbol Order ticker pair, for example `BTC/USDT`
     * @param {string} order.id Binance order id
     */
    async cancelOrder(order) {
        utils.validateOrderForCanceling(order);

        if (!order.symbol) {
            // 	┬──┬ ノ(ò_óノ) Binance api kills nerve cells
            const openOrders = await this.fetchOpenOrders();

            const responce = openOrders[Symbol.for('zenfuse.originalPayload')];

            const orderToDelete = responce.find((o) => {
                return o.orderId === order.id;
            });

            if (!orderToDelete) {
                throw new Error('Order symbol not found'); // TODO: Specific error desc
            }

            order.symbol = orderToDelete.symbol;
        }

        const response = await this.privateFetch('api/v3/order', {
            method: 'DELETE',
            searchParams: {
                symbol: order.symbol,
                orderId: order.id.toString(),
            },
        });

        // TODO: Order type

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

    getAccountDataStream() {
        return new AccountDataStream(this);
    }

    getMarketDataStream() {
        return new MarketDataStream(this);
    }
}

module.exports = BinanceSpot;
